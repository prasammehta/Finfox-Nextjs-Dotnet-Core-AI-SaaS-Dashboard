using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using FinfoxApi.Data;
using FinfoxApi.Interfaces;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Services;
using FinfoxApi.Mappers;
using Swashbuckle.AspNetCore.SwaggerUI;
using Microsoft.AspNetCore.Identity;
using FinfoxApi.Plugins;
using Microsoft.SemanticKernel;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Add Swagger/Swashbuckle
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Finfox API",
        Version = "v1",
        Description = "Financial management API for tracking accounts, transactions, debts, and investments",
        Contact = new Microsoft.OpenApi.OpenApiContact
        {
            Name = "Finfox Team",
            Email = "support@finfox.com"
        }
    });

    // Add Bearer Token Authorization to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below."
    });
});

// OpenAI settings
var openAiKey = builder.Configuration["OpenAI:ApiKey"];
var model = builder.Configuration["OpenAI:Model"];

// Database Configuration - Using PostgreSQL
builder.Services.AddDbContext<FinfoxApiDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository Registrations (Generic Repository Pattern)
builder.Services.AddScoped<IRepository<User>, BaseRepository<User>>();
builder.Services.AddScoped<IRepository<Account>, BaseRepository<Account>>();
builder.Services.AddScoped<IRepository<Transaction>, BaseRepository<Transaction>>();
builder.Services.AddScoped<IRepository<RecurringTransaction>, BaseRepository<RecurringTransaction>>();
builder.Services.AddScoped<IRepository<Bill>, BaseRepository<Bill>>();
builder.Services.AddScoped<IRepository<BillCompany>, BaseRepository<BillCompany>>();
builder.Services.AddScoped<IRepository<Debt>, BaseRepository<Debt>>();
builder.Services.AddScoped<IRepository<Investment>, BaseRepository<Investment>>();

// Service Registrations (Business Logic Layer)
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IRecurringTransactionService, RecurringTransactionService>();
builder.Services.AddScoped<IBillService, BillService>();
builder.Services.AddScoped<IBillCompanyService, BillCompanyService>();
builder.Services.AddScoped<IDebtService, DebtService>();
builder.Services.AddScoped<IInvestmentService, InvestmentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAiService, AiService>();

// Mapper Registration
builder.Services.AddScoped<IMapper, Mapper>();

// Password Hasher Registration
builder.Services.AddScoped<PasswordHasher<FinfoxApi.Models.User>>();

// Add File Service for logo uploads
builder.Services.AddScoped<IFileService, FileService>();

// Add Semantic Kernel
builder.Services.AddScoped<Kernel>(sp =>
{
    var kernelBuilder = Kernel.CreateBuilder();
    
    kernelBuilder.AddOpenAIChatCompletion(
        modelId: model!,
        apiKey: openAiKey!
    );

    var kernel = kernelBuilder.Build();
    

    return kernel;
});

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings.GetValue<string>("SecretKey") ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var issuer = jwtSettings.GetValue<string>("Issuer") ?? throw new InvalidOperationException("JWT Issuer is not configured");
var audience = jwtSettings.GetValue<string>("Audience") ?? throw new InvalidOperationException("JWT Audience is not configured");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        corsBuilder =>
        {
            corsBuilder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    // Enable Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Finfox API V1");
        c.DocExpansion(DocExpansion.List);
    });
}

app.UseHttpsRedirection();
app.UseRouting();

// Authentication and Authorization Middleware
app.UseAuthentication();
app.UseAuthorization();

// CORS Middleware
app.UseCors("AllowAll");

app.UseStaticFiles();

app.MapControllers();

try
{
    Log.Information("Application starting up");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
