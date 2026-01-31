using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;

namespace FinfoxApi.Data;

public class FinfoxApiDbContext : DbContext
{
    public FinfoxApiDbContext(DbContextOptions<FinfoxApiDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<RecurringTransaction> RecurringTransactions { get; set; }
    public DbSet<Bill> Bills { get; set; }
    public DbSet<BillCompany> BillCompanies { get; set; }
    public DbSet<Debt> Debts { get; set; }
    public DbSet<Investment> Investments { get; set; }
    public DbSet<AiChatSession> AiChatSessions { get; set; }
    public DbSet<AiChatMessage> AiChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureAccount(modelBuilder);
        ConfigureTransaction(modelBuilder);
        ConfigureRecurringTransaction(modelBuilder);
        ConfigureBill(modelBuilder);
        ConfigureBillCompany(modelBuilder);
        ConfigureDebt(modelBuilder);
        ConfigureInvestment(modelBuilder);
        ConfigureAiChat(modelBuilder);

        //SeedData(modelBuilder);
    }

    private void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("User");
            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Email)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.PasswordHash)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Role)
                .IsRequired()
                .HasColumnType("text")
                .HasDefaultValue("User");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.DebtBotHistory)
                .HasColumnType("jsonb");

            entity.Property(e => e.InvestmentBotHistory)
                .HasColumnType("jsonb");

            entity.Property(e => e.RecurringInvestBotHistory)
                .HasColumnType("jsonb");

            entity.Property(e => e.TransactionBotHistory)
                .HasColumnType("jsonb");
            

            entity.HasIndex(e => e.Email)
                .IsUnique();

            // Navigation relationships
            entity.HasMany(e => e.Accounts)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Debts)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Investments)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.RecurringTransactions)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Transactions)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private void ConfigureAccount(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("Account");
            entity.HasKey(e => e.AccountId);

            entity.Property(e => e.AccountId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.InitialBalance)
                .HasColumnType("double precision")
                .HasDefaultValue(0f);

            entity.Property(e => e.CurrentBalance)
                .HasColumnType("double precision")
                .HasDefaultValue(0f);

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(e => e.UserId);

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(e => e.Accounts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.RecurringTransactions)
                .WithOne(e => e.Account)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.TransactionsFrom)
                .WithOne(e => e.FromAccount)
                .HasForeignKey(e => e.FromAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.TransactionsTo)
                .WithOne(e => e.ToAccount)
                .HasForeignKey(e => e.ToAccountId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private void ConfigureTransaction(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transaction");
            entity.HasKey(e => e.TransactionId);

            entity.Property(e => e.TransactionId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Amount)
                .IsRequired()
                .HasColumnType("double precision");

            entity.Property(e => e.Date)
                .IsRequired()
                .HasColumnType("date");

            entity.Property(e => e.Description)
                .HasColumnType("text");

            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.Category)
                .HasConversion<string>();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.FromAccountId);
            entity.HasIndex(e => e.ToAccountId);
            entity.HasIndex(e => e.DebtId);
            entity.HasIndex(e => e.RecurringTransactionId);

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(e => e.Transactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.FromAccount)
                .WithMany(e => e.TransactionsFrom)
                .HasForeignKey(e => e.FromAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ToAccount)
                .WithMany(e => e.TransactionsTo)
                .HasForeignKey(e => e.ToAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Debt)
                .WithMany(e => e.Transactions)
                .HasForeignKey(e => e.DebtId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.RecurringTransaction)
                .WithMany(e => e.GeneratedTransactions)
                .HasForeignKey(e => e.RecurringTransactionId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private void ConfigureRecurringTransaction(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RecurringTransaction>(entity =>
        {
            entity.ToTable("RecurringTransaction");
            entity.HasKey(e => e.RecurringTransactionId);

            entity.Property(e => e.RecurringTransactionId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Amount)
                .IsRequired()
                .HasColumnType("double precision");

            entity.Property(e => e.Description)
                .HasColumnType("text");

            entity.Property(e => e.Category)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.Frequency)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.StartDate)
                .IsRequired()
                .HasColumnType("date");

            entity.Property(e => e.EndDate)
                .HasColumnType("date");

            entity.Property(e => e.LastGeneratedDate)
                .HasColumnType("date");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.AccountId)
                .IsRequired();

            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<string>();

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.AccountId);

            // Relationships
            entity.HasOne(e => e.Account)
                .WithMany(e => e.RecurringTransactions)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(e => e.RecurringTransactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.GeneratedTransactions)
                .WithOne(e => e.RecurringTransaction)
                .HasForeignKey(e => e.RecurringTransactionId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private void ConfigureBill(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bill>(entity =>
        {
            entity.ToTable("Bill");
            entity.HasKey(e => e.BillId);

            entity.Property(e => e.BillId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.BillFromId)
                .IsRequired()
                .HasColumnType("integer");

            entity.Property(e => e.BillToId)
                .IsRequired()
                .HasColumnType("integer");

            entity.Property(e => e.InvoiceNumber)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Client)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.IssueDate)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.DueDate)
                .IsRequired()
                .HasColumnType("timestamp with time zone");

            entity.Property(e => e.GstRate)
                .IsRequired()
                .HasColumnType("double precision")
                .HasDefaultValue(0);

            entity.Property(e => e.TdsPercent)
                .IsRequired()
                .HasColumnType("double precision")
                .HasDefaultValue(0);

            entity.Property(e => e.Subtotal)
                .IsRequired()
                .HasColumnType("double precision")
                .HasDefaultValue(0);

            entity.Property(e => e.GstAmount)
                .IsRequired()
                .HasColumnType("double precision")
                .HasDefaultValue(0);

            entity.Property(e => e.TotalAmount)
                .IsRequired()
                .HasColumnType("double precision")
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.BillItems)
                .HasColumnType("jsonb");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.BillFromId);
            entity.HasIndex(e => e.BillToId);

            // Relationships
            entity.HasOne(e => e.BillFrom)
                .WithMany()
                .HasForeignKey(e => e.BillFromId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            entity.HasOne(e => e.BillTo)
                .WithMany()
                .HasForeignKey(e => e.BillToId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
        });
    }

    private void ConfigureBillCompany(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BillCompany>(entity =>
        {
            entity.ToTable("BillCompany");
            entity.HasKey(e => e.BillCompanyId);

            entity.Property(e => e.BillCompanyId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Address)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Gstin)
                .HasColumnType("text");

            entity.Property(e => e.Pan)
                .HasColumnType("text");

            entity.Property(e => e.TdsPercent)
                .HasColumnType("text");

            entity.Property(e => e.Email)
                .HasColumnType("text");

            entity.Property(e => e.Phone)
                .HasColumnType("text");

            entity.Property(e => e.AccountName)
                .HasColumnType("text");

            entity.Property(e => e.AccountNumber)
                .HasColumnType("text");

            entity.Property(e => e.IfscCode)
                .HasColumnType("text");

            entity.Property(e => e.LogoUrl)
                .HasColumnType("text");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(e => e.UserId);
        });
    }

    private void ConfigureDebt(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Debt>(entity =>
        {
            entity.ToTable("Debt");
            entity.HasKey(e => e.DebtId);

            entity.Property(e => e.DebtId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.PersonName)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Amount)
                .IsRequired()
                .HasColumnType("double precision");

            entity.Property(e => e.DebtType)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Date)
                .IsRequired()
                .HasColumnType("date");

            entity.Property(e => e.DueDate)
                .HasColumnType("date");

            entity.Property(e => e.Notes)
                .HasColumnType("text");

            entity.Property(e => e.Status)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.PaidAmount)
                .HasColumnType("double precision")
                .HasDefaultValue(0f);

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(e => e.UserId);

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(e => e.Debts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Transactions)
                .WithOne(e => e.Debt)
                .HasForeignKey(e => e.DebtId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private void ConfigureInvestment(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Investment>(entity =>
        {
            entity.ToTable("Investment");
            entity.HasKey(e => e.InvestmentId);

            entity.Property(e => e.InvestmentId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.InitialAmount)
                .IsRequired()
                .HasColumnType("double precision");

            entity.Property(e => e.CurrentValue)
                .IsRequired()
                .HasColumnType("double precision");

            entity.Property(e => e.DateAcquired)
                .IsRequired()
                .HasColumnType("date");

            entity.Property(e => e.Notes)
                .HasColumnType("text");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(e => e.UserId);

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(e => e.Investments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    // private static void SeedData(ModelBuilder modelBuilder)
    // {
    //     // -----------------------------
    //     // USERS
    //     // -----------------------------
    //     var userIds = Enumerable.Range(1, 10)
    //         .Select(i => Guid.Parse($"00000000-0000-0000-0000-{i:D12}"))
    //         .ToArray();

    //     modelBuilder.Entity<User>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new User
    //         {
    //             UserId = userIds[i - 1],
    //             Name = $"User {i}",
    //             Email = $"user{i}@finfox.com",
    //             PasswordHash = "hashed_password",
    //             DebtBotHistory = new List<string> { "init" },
    //             InvestmentBotHistory = new List<string> { "init" },
    //             TransactionBotHistory = new List<string> { "init" },
    //             RecurringInvestBotHistory = new List<string> { "init" }
    //         })
    //     );

    //     // -----------------------------
    //     // ACCOUNTS
    //     // -----------------------------
    //     modelBuilder.Entity<Account>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new Account
    //         {
    //             AccountId = i,
    //             UserId = userIds[i - 1],
    //             Name = $"Account {i}",
    //             InitialBalance = 10000 + (i * 1000),
    //             CurrentBalance = 12000 + (i * 1200)
    //         })
    //     );

    //     // -----------------------------
    //     // DEBTS
    //     // -----------------------------
    //     modelBuilder.Entity<Debt>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new Debt
    //         {
    //             DebtId = i,
    //             UserId = userIds[i - 1],
    //             PersonName = $"Person {i}",
    //             DebtType = i % 2 == 0 ? "Loan" : "Borrowed",
    //             Amount = 5000 + (i * 500),
    //             PaidAmount = i * 200,
    //             Status = i % 2 == 0 ? "Open" : "Closed",
    //             Date = DateTime.UtcNow.Date.AddDays(-i),
    //             DueDate = DateTime.UtcNow.Date.AddDays(30),
    //             Notes = "Seed debt"
    //         })
    //     );

    //     // -----------------------------
    //     // INVESTMENTS
    //     // -----------------------------
    //     modelBuilder.Entity<Investment>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new Investment
    //         {
    //             InvestmentId = i,
    //             UserId = userIds[i - 1],
    //             Name = $"Investment {i}",
    //             Type = i % 2 == 0 ? InvestmentType.STOCK : InvestmentType.MUTUAL_FUND,
    //             InitialAmount = 10000 + (i * 1000),
    //             CurrentValue = 12000 + (i * 1200),
    //             DateAcquired = DateTime.UtcNow.Date.AddMonths(-i),
    //             Notes = "Seed investment"
    //         })
    //     );

    //     // -----------------------------
    //     // RECURRING TRANSACTIONS
    //     // -----------------------------
    //     modelBuilder.Entity<RecurringTransaction>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new RecurringTransaction
    //         {
    //             RecurringTransactionId = i,
    //             UserId = userIds[i - 1],
    //             AccountId = i,
    //             Amount = 1500 + (i * 100),
    //             Category = Category.UTILITIES,
    //             Type = RecurringTransactionType.EXPENSE,
    //             Frequency = Frequency.MONTHLY,
    //             StartDate = DateTime.UtcNow.Date.AddMonths(-3),
    //             EndDate = null,
    //             IsActive = true,
    //             Description = $"Recurring payment {i}",
    //             LastGeneratedDate = null
    //         })
    //     );

    //     // -----------------------------
    //     // TRANSACTIONS
    //     // -----------------------------
    //     modelBuilder.Entity<Transaction>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new Transaction
    //         {
    //             TransactionId = i,
    //             UserId = userIds[i - 1],
    //             Amount = 1000 + (i * 100),
    //             Category = Category.OTHER_EXPENSE,
    //             Type = i % 2 == 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
    //             Date = DateTime.UtcNow.Date.AddDays(-i),
    //             FromAccountId = i,
    //             ToAccountId = null,
    //             DebtId = i,
    //             RecurringTransactionId = i,
    //             Description = $"Transaction {i}"
    //         })
    //     );

    //     // -----------------------------
    //     // BILLS
    //     // -----------------------------
    //     modelBuilder.Entity<Bill>().HasData(
    //         Enumerable.Range(1, 10).Select(i => new Bill
    //         {
    //             BillId = i,
    //             UserId = userIds[i - 1],
    //             Client = $"Client {i}",
    //             Company = "Finfox Pvt Ltd",
    //             CompanyAddress = "Ahmedabad, India",
    //             CompanyEmail = "billing@finfox.com",
    //             CompanyWebsite = "https://finfox.com",
    //             CompanyTag = "FINTECH",
    //             BillItems = new List<string> { "Item A", "Item B" },
    //             Tax = 18,
    //             IssueDate = DateTime.UtcNow.Date.AddDays(-5),
    //             DueDate = DateTime.UtcNow.Date.AddDays(15),
    //             BankName = "HDFC Bank",
    //             BankAccountNumber = "1234567890",
    //             BankIfscCode = "HDFC0001234"
    //         })
    //     );
    // }

    private void ConfigureAiChat(ModelBuilder modelBuilder)
    {
        // Configure AiChatSession
        modelBuilder.Entity<AiChatSession>(entity =>
        {
            entity.ToTable("AiChatSession");
            entity.HasKey(e => e.ChatSessionId);

            entity.Property(e => e.ChatSessionId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Title)
                .IsRequired()
                .HasColumnType("text")
                .HasMaxLength(255);

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
        });

        // Configure AiChatMessage
        modelBuilder.Entity<AiChatMessage>(entity =>
        {
            entity.ToTable("AiChatMessage");
            entity.HasKey(e => e.ChatMessageId);

            entity.Property(e => e.ChatMessageId)
                .HasColumnType("integer")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.ChatSessionId)
                .IsRequired()
                .HasColumnType("integer");

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasColumnType("uuid");

            entity.Property(e => e.Role)
                .IsRequired()
                .HasColumnType("text")
                .HasMaxLength(50);

            entity.Property(e => e.Content)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasOne(e => e.ChatSession)
                .WithMany(s => s.Messages)
                .HasForeignKey(e => e.ChatSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ChatSessionId);
            entity.HasIndex(e => e.UserId);
        });
    }


}
