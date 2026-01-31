using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text.Json;
using FinfoxApi.Data;
using FinfoxApi.Interfaces;
using FinfoxApi.Models;
using FinfoxApi.ViewModels;
using FinfoxApi.Plugins;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace FinfoxApi.Services;

public class AiService : IAiService
{
    private readonly Kernel _kernel;
    private readonly FinfoxApiDbContext _context;
    private readonly ILogger<AiService> _logger;

    private readonly ITransactionService _transactionService;
    private readonly IAccountService _accountService;
    private readonly IDebtService _debtService;
    private readonly IInvestmentService _investmentService;
    private readonly IRecurringTransactionService _recurringTransactionService;
    private readonly IBillService _billService;
    private readonly ILogger<TransactionPlugin> _transactionPluginLogger;
    private readonly ILogger<FinfoxPlugin> _finfoxPluginLogger;
    


    public AiService(
        Kernel kernel,
        FinfoxApiDbContext context,
        ILogger<AiService> logger,
        IConfiguration configuration,
        ITransactionService transactionService,
        IAccountService accountService,
        IDebtService debtService,
        IInvestmentService investmentService,
        IRecurringTransactionService recurringTransactionService,
        IBillService billService,
        ILogger<FinfoxPlugin> finfoxPluginLogger,
        ILogger<TransactionPlugin> transactionPluginLogger)
    {
        _kernel = kernel;
        _context = context;
        _logger = logger;

        _transactionService = transactionService;
        _accountService = accountService;
        _debtService = debtService;
        _transactionPluginLogger = transactionPluginLogger;
        _investmentService = investmentService;
        _recurringTransactionService = recurringTransactionService;
        _billService = billService;
        _finfoxPluginLogger = finfoxPluginLogger;

    }

    public async Task<AiChatResponseVM> ProcessChatMessageAsync(AiChatRequestVM request)
    {
        try
        {

            if (string.IsNullOrEmpty(request.Message))
                return new AiChatResponseVM
                {
                    Error = "Message cannot be empty",
                    Messages = new List<AiChatMessageVM>()
                };

            if(request.BotType == BotType.TRANSACTION_HELPER)
            {
            _kernel.ImportPluginFromObject(
                new TransactionPlugin(_transactionService, _accountService, _debtService, _transactionPluginLogger),
                "transactions"
            );

            }
            else{
                _kernel.ImportPluginFromObject(
                    new FinfoxPlugin(_transactionService, _accountService, _billService, _debtService, _investmentService, _recurringTransactionService, _finfoxPluginLogger), 
                    "finfox");
            }


            // Get or create ONE chat session per user
            AiChatSession? session = await _context.AiChatSessions
                .Include(s => s.Messages)
                .FirstOrDefaultAsync(s => s.UserId == request.UserId);

            if (session == null)
            {
                session = new AiChatSession
                {
                    UserId = request.UserId,
                    Title = request.Message.Substring(0, Math.Min(50, request.Message.Length)),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.AiChatSessions.Add(session);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update the session's title if it's empty
                if (string.IsNullOrEmpty(session.Title))
                {
                    session.Title = request.Message.Substring(0, Math.Min(50, request.Message.Length));
                }
                session.UpdatedAt = DateTime.UtcNow;
            }

            // Save user message
            var userMessage = new AiChatMessage
            {
                ChatSessionId = session.ChatSessionId,
                UserId = request.UserId,
                Role = "user",
                Content = request.Message,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.AiChatMessages.Add(userMessage);
            await _context.SaveChangesAsync();

            // Create system prompt with current date/time context
            var currentDateTime = DateTime.UtcNow;

            // Get chat history for context
            var chatHistory = new ChatHistory();

            // Create system prompt - keep it minimal, let Semantic Kernel handle function schema
            string systemPrompt = $"""
                    You are an AI assistant and finance adviser for Finfox.

                    CRITICAL RULES:
                    - You MUST use kernel functions to answer any question related to:
                    accounts, balances, transactions, debts, or financial data.
                    - You are NOT allowed to guess or infer values.
                    - If data is not available via tools, say: "I don’t have access to that information."

                    DO NOT answer from general knowledge.
                    DO NOT fabricate responses.

                    DO Advice users on financial matters based on best practices.
                    DO check user's financial data via tools before giving advice.
                    DO check user's previous messages to give better advice.
                    DO use icons/emojis in your responses to make them engaging.

                    Current date: {currentDateTime:yyyy-MM-dd}
                    User ID: {request.UserId}
                    """;

            if(request.BotType == BotType.TRANSACTION_HELPER)
            {
                systemPrompt = $"""
                    You are an AI assistant for Finfox transactions.

                    CRITICAL RULES:
                    - You MUST use kernel functions to answer any question related to:
                     accounts, balances, transactions, debts, or financial data.
                    - You are NOT allowed to guess or infer values.
                    - If data is not available via tools, say: "I don’t have access to that information."

                    DO NOT answer from general knowledge.
                    DO NOT fabricate responses.

                    DO not give financial advice. You should only help with transactions.
                    For better summary and insights, suggest user to use Finfox Adviser bot.
                    DO create or read transactions via tools as requested by the user.
                    DO check user's previous messages to give better assistance.
                    DO use icons/emojis in your responses to make them engaging.

                    Current date: {currentDateTime:yyyy-MM-dd}
                    User ID: {request.UserId}
                    """;
            }
           
            // Get AI response
            chatHistory.AddSystemMessage(systemPrompt);

            var previousMessages = session.Messages.OrderBy(m => m.CreatedAt).ToList();

            foreach (var msg in previousMessages)
            {
                if (msg.Role == "user")
                    chatHistory.AddUserMessage(msg.Content);
                else
                    chatHistory.AddAssistantMessage(msg.Content);
            }

            // Log available plugins/functions
            _logger.LogInformation($"Kernel plugins: {string.Join(", ", _kernel.Plugins.Select(p => p.Name))}");
            foreach (var plugin in _kernel.Plugins)
            {
                var functionCount = plugin?.Count() ?? 0;
                _logger.LogInformation($"Plugin '{plugin.Name}' has {functionCount} functions");
                foreach (var function in plugin)
                {
                    _logger.LogInformation($"  - Function: {function.Name}");
                }
            }

            var chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();

            var settings = new OpenAIPromptExecutionSettings
            {
                ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                Temperature = 0,
                MaxTokens = 2000
            };

            _logger.LogInformation($"=== CHAT REQUEST DEBUG ===");
            _logger.LogInformation($"Available plugins: {_kernel.Plugins.Count}");
            foreach (var plugin in _kernel.Plugins)
            {
                _logger.LogInformation($"  Plugin '{plugin.Name}': {plugin?.Count() ?? 0} functions");
                foreach (var func in plugin)
                {
                    _logger.LogInformation($"    - {func.Name}");
                }
            }
            _logger.LogInformation($"ToolCallBehavior: {settings.ToolCallBehavior}");
            _logger.LogInformation($"User Message: {request.Message}");

            // IMPORTANT: Pass kernel to enable auto-invocation of tools
            var response = await chatCompletionService.GetChatMessageContentAsync(
                chatHistory,
                settings,
                kernel: _kernel);

            _logger.LogInformation($"=== CHAT RESPONSE DEBUG ===");
            _logger.LogInformation($"Response Content: {response.Content?.Substring(0, Math.Min(200, response.Content?.Length ?? 0)) ?? "null"}");
            _logger.LogInformation($"Response Type: {response.GetType().Name}");

            var assistantContent = response.Content ?? "I encountered an issue processing your request.";

            // Save assistant response
            var assistantMessage = new AiChatMessage
            {
                ChatSessionId = session.ChatSessionId,
                UserId = request.UserId,
                Role = "assistant",
                Content = assistantContent,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.AiChatMessages.Add(assistantMessage);
            await _context.SaveChangesAsync();

            // Refresh messages from database to include the newly saved message
            session = await _context.AiChatSessions
                .Include(s => s.Messages)
                .FirstOrDefaultAsync(s => s.ChatSessionId == session.ChatSessionId);

            var messages = (session?.Messages.OrderBy(m => m.CreatedAt).ToList() ?? new List<AiChatMessage>())
                .Select(m => new AiChatMessageVM
                {
                    ChatMessageId = m.ChatMessageId,
                    Role = m.Role,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt
                })
                .ToList();

            return new AiChatResponseVM
            {
                ChatSessionId = session?.ChatSessionId ?? 0,
                Messages = messages,
                LastAssistantMessage = new AiChatMessageVM
                {
                    ChatMessageId = assistantMessage.ChatMessageId,
                    Role = "assistant",
                    Content = assistantContent,
                    CreatedAt = assistantMessage.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return new AiChatResponseVM
            {
                Error = "An error occurred while processing your message. Please try again.",
                Messages = new List<AiChatMessageVM>()
            };
        }
    }

    public async Task<AiTransactionIntentVM> ExtractTransactionIntentAsync(string userMessage, Guid userId)
    {
        try
        {
            var chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();

            string extractionPrompt = $@"Extract transaction intent from this user message: ""{userMessage}""

Respond in JSON format with:
{{
  ""intent"": ""CREATE|READ|UPDATE|DELETE"",
  ""data"": {{
    ""amount"": number or null,
    ""date"": ""YYYY-MM-DD"" or null,
    ""description"": string or null,
    ""type"": ""INCOME|EXPENSE"" or null,
    ""category"": string or null,
    ""fromAccountId"": number or null,
    ""toAccountId"": number or null,
    ""debtId"": number or null
  }},
  ""missingFields"": [list of required fields that are missing],
  ""isValid"": boolean,
  ""errorMessage"": string or null
}}

Be strict about required fields for CREATE transactions:
- Amount (must be > 0)
- Type (INCOME or EXPENSE)
- FromAccountId (must be valid)

Optional fields: Date (defaults to today), Description, Category, ToAccountId, DebtId";

            var result = await chatCompletionService.GetChatMessageContentAsync(
                new ChatHistory(extractionPrompt));
            var jsonContent = result.Content ?? "{}";

            // Clean up JSON if needed
            if (jsonContent.Contains("```json"))
                jsonContent = jsonContent.Replace("```json", "").Replace("```", "");
            else if (jsonContent.Contains("```"))
                jsonContent = jsonContent.Replace("```", "");

            var intent = JsonSerializer.Deserialize<AiTransactionIntentVM>(jsonContent.Trim(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return intent ?? new AiTransactionIntentVM
            {
                ErrorMessage = "Failed to parse intent",
                IsValid = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting transaction intent");
            return new AiTransactionIntentVM
            {
                ErrorMessage = $"Error extracting intent: {ex.Message}",
                IsValid = false
            };
        }
    }

    public async Task<List<AiChatSessionVM>> GetChatHistoryAsync(Guid userId)
    {
        try
        {
            var sessions = await _context.AiChatSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Messages)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new AiChatSessionVM
                {
                    ChatSessionId = s.ChatSessionId,
                    Title = s.Title,
                    CreatedAt = s.CreatedAt,
                    MessageCount = s.Messages.Count
                })
                .ToListAsync();

            return sessions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat history");
            return new List<AiChatSessionVM>();
        }
    }

    public async Task<List<AiChatSessionVM>> GetSessionsByUserIdAsync(Guid userId)
    {
        try
        {
            var sessions = await _context.AiChatSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Messages)
                .OrderByDescending(s => s.UpdatedAt)
                .Select(s => new AiChatSessionVM
                {
                    ChatSessionId = s.ChatSessionId,
                    Title = s.Title,
                    CreatedAt = s.CreatedAt,
                    MessageCount = s.Messages.Count
                })
                .ToListAsync();

            return sessions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sessions for user");
            return new List<AiChatSessionVM>();
        }
    }

    public async Task<AiChatResponseVM> GetChatSessionMessagesAsync(Guid userId, int chatSessionId)
    {
        try
        {
            var session = await _context.AiChatSessions
                .Include(s => s.Messages)
                .FirstOrDefaultAsync(s => s.ChatSessionId == chatSessionId && s.UserId == userId);

            if (session == null)
                return new AiChatResponseVM
                {
                    Error = "Chat session not found",
                    Messages = new List<AiChatMessageVM>()
                };

            var messages = session.Messages
                .OrderBy(m => m.CreatedAt)
                .Select(m => new AiChatMessageVM
                {
                    ChatMessageId = m.ChatMessageId,
                    Role = m.Role,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt
                })
                .ToList();

            return new AiChatResponseVM
            {
                ChatSessionId = session.ChatSessionId,
                Messages = messages
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat session messages");
            return new AiChatResponseVM
            {
                Error = "Failed to retrieve chat session",
                Messages = new List<AiChatMessageVM>()
            };
        }
    }

    public async Task DeleteChatSessionAsync(Guid userId, int chatSessionId)
    {
        try
        {
            var session = await _context.AiChatSessions
                .FirstOrDefaultAsync(s => s.ChatSessionId == chatSessionId && s.UserId == userId);

            if (session != null)
            {
                _context.AiChatSessions.Remove(session);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting chat session");
            throw;
        }
    }
}
