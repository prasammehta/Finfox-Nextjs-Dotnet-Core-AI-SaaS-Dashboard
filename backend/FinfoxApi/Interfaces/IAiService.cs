using FinfoxApi.Models;
using FinfoxApi.ViewModels;

namespace FinfoxApi.Interfaces;

public interface IAiService
{
    Task<AiChatResponseVM> ProcessChatMessageAsync(AiChatRequestVM request);
    Task<AiTransactionIntentVM> ExtractTransactionIntentAsync(string userMessage, Guid userId);
    Task<List<AiChatSessionVM>> GetChatHistoryAsync(Guid userId);
    Task<List<AiChatSessionVM>> GetSessionsByUserIdAsync(Guid userId);
    Task<AiChatResponseVM> GetChatSessionMessagesAsync(Guid userId, int chatSessionId);
    Task DeleteChatSessionAsync(Guid userId, int chatSessionId);
}
