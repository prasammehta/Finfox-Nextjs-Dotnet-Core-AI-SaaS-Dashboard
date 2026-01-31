namespace FinfoxApi.Mappers;

using FinfoxApi.Models;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;

/// <summary>
/// Mapper implementation for converting between Models and ViewModels.
/// Handles all entity-to-viewmodel mappings and enum conversions.
/// </summary>
public class Mapper : IMapper
{
    // ==================== User Mapping ====================
    public User MapCreateUserVMToUser(CreateUserVM createUserVM)
    {
        return new User
        {
            UserId = Guid.NewGuid(),
            Name = createUserVM.Name,
            Email = createUserVM.Email,
            PasswordHash = createUserVM.Password, // In production, hash the password with BCrypt
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public User MapUpdateUserVMToUser(UpdateUserVM updateUserVM, User existingUser)
    {
        existingUser.Name = updateUserVM.Name;
        existingUser.Email = updateUserVM.Email;
        existingUser.UpdatedAt = DateTime.UtcNow;
        return existingUser;
    }

    public UserResponseVM MapUserToUserResponseVM(User user)
    {
        return new UserResponseVM
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    // ==================== Account Mapping ====================
    public Account MapCreateAccountVMToAccount(CreateAccountVM createAccountVM)
    {
        return new Account
        {
            UserId = createAccountVM.UserId,
            Name = createAccountVM.Name,
            InitialBalance = createAccountVM.InitialBalance,
            CurrentBalance = createAccountVM.InitialBalance,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Account MapUpdateAccountVMToAccount(UpdateAccountVM updateAccountVM, Account existingAccount)
    {
        existingAccount.Name = updateAccountVM.Name;
        existingAccount.InitialBalance = updateAccountVM.InitialBalance;
        existingAccount.CurrentBalance = updateAccountVM.CurrentBalance;
        existingAccount.UpdatedAt = DateTime.UtcNow;
        return existingAccount;
    }

    public AccountResponseVM MapAccountToAccountResponseVM(Account account)
    {
        return new AccountResponseVM
        {
            AccountId = account.AccountId,
            UserId = account.UserId,
            Name = account.Name,
            InitialBalance = account.InitialBalance,
            CurrentBalance = account.CurrentBalance,
            CreatedAt = account.CreatedAt,
            UpdatedAt = account.UpdatedAt
        };
    }

    // ==================== Transaction Mapping ====================
    public Transaction MapCreateTransactionVMToTransaction(CreateTransactionVM createTransactionVM)
    {
        return new Transaction
        {
            UserId = createTransactionVM.UserId,
            Amount = createTransactionVM.Amount,
            Date = createTransactionVM.Date,
            Description = createTransactionVM.Description,
            Type = Enum.Parse<TransactionType>(createTransactionVM.Type),
            Category = string.IsNullOrEmpty(createTransactionVM.Category) ? null : Enum.Parse<Category>(createTransactionVM.Category),
            FromAccountId = createTransactionVM.FromAccountId,
            ToAccountId = createTransactionVM.ToAccountId,
            DebtId = createTransactionVM.DebtId,
            RecurringTransactionId = createTransactionVM.RecurringTransactionId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Transaction MapUpdateTransactionVMToTransaction(UpdateTransactionVM updateTransactionVM, Transaction existingTransaction)
    {
            existingTransaction.Amount = updateTransactionVM.Amount;
            existingTransaction.Date = updateTransactionVM.Date;
            existingTransaction.Description = updateTransactionVM.Description;
            existingTransaction.Type = Enum.Parse<TransactionType>(updateTransactionVM.Type);
            existingTransaction.Category = string.IsNullOrEmpty(updateTransactionVM.Category) ? null : Enum.Parse<Category>(updateTransactionVM.Category);
            existingTransaction.FromAccountId = updateTransactionVM.FromAccountId;
            existingTransaction.ToAccountId = updateTransactionVM.ToAccountId;
            existingTransaction.DebtId = updateTransactionVM.DebtId;
            existingTransaction.RecurringTransactionId = updateTransactionVM.RecurringTransactionId;
            existingTransaction.UpdatedAt = DateTime.UtcNow;
            return existingTransaction;
    }

    public TransactionResponseVM MapTransactionToTransactionResponseVM(Transaction transaction)
    {
        return new TransactionResponseVM
        {
            TransactionId = transaction.TransactionId,
            UserId = transaction.UserId,
            Amount = transaction.Amount,
            Date = transaction.Date,
            Description = transaction.Description,
            Type = transaction.Type.ToString(),
            Category = transaction.Category?.ToString(),
            FromAccountId = transaction.FromAccountId,
            ToAccountId = transaction.ToAccountId,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt
        };
    }

    // ==================== RecurringTransaction Mapping ====================
    public RecurringTransaction MapCreateRecurringTransactionVMToRecurringTransaction(CreateRecurringTransactionVM createRecurringTransactionVM)
    {
        return new RecurringTransaction
        {
            UserId = createRecurringTransactionVM.UserId,
            Amount = createRecurringTransactionVM.Amount,
            Description = createRecurringTransactionVM.Description,
            Category = Enum.Parse<Category>(createRecurringTransactionVM.Category),
            Frequency = Enum.Parse<Frequency>(createRecurringTransactionVM.Frequency),
            Type = Enum.Parse<RecurringTransactionType>(createRecurringTransactionVM.Type),
            StartDate = createRecurringTransactionVM.StartDate,
            EndDate = createRecurringTransactionVM.EndDate,
            AccountId = createRecurringTransactionVM.AccountId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public RecurringTransaction MapUpdateRecurringTransactionVMToRecurringTransaction(UpdateRecurringTransactionVM updateRecurringTransactionVM, RecurringTransaction existingRecurringTransaction)
    {
        existingRecurringTransaction.Amount = updateRecurringTransactionVM.Amount;
        existingRecurringTransaction.Description = updateRecurringTransactionVM.Description;
        existingRecurringTransaction.Category = Enum.Parse<Category>(updateRecurringTransactionVM.Category);
        existingRecurringTransaction.Frequency = Enum.Parse<Frequency>(updateRecurringTransactionVM.Frequency);
        existingRecurringTransaction.Type = Enum.Parse<RecurringTransactionType>(updateRecurringTransactionVM.Type);
        existingRecurringTransaction.StartDate = updateRecurringTransactionVM.StartDate;
        existingRecurringTransaction.EndDate = updateRecurringTransactionVM.EndDate;
        existingRecurringTransaction.AccountId = updateRecurringTransactionVM.AccountId;
        existingRecurringTransaction.IsActive = updateRecurringTransactionVM.IsActive;
        existingRecurringTransaction.UpdatedAt = DateTime.UtcNow;
        return existingRecurringTransaction;
    }

    public RecurringTransactionResponseVM MapRecurringTransactionToRecurringTransactionResponseVM(RecurringTransaction recurringTransaction)
    {
        return new RecurringTransactionResponseVM
        {
            RecurringTransactionId = recurringTransaction.RecurringTransactionId,
            UserId = recurringTransaction.UserId,
            Amount = recurringTransaction.Amount,
            Description = recurringTransaction.Description,
            Category = recurringTransaction.Category.ToString(),
            Frequency = recurringTransaction.Frequency.ToString(),
            Type = recurringTransaction.Type.ToString(),
            StartDate = recurringTransaction.StartDate,
            EndDate = recurringTransaction.EndDate,
            LastGeneratedDate = recurringTransaction.LastGeneratedDate,
            AccountId = recurringTransaction.AccountId,
            IsActive = recurringTransaction.IsActive,
            CreatedAt = recurringTransaction.CreatedAt,
            UpdatedAt = recurringTransaction.UpdatedAt
        };
    }

    // ==================== Bill Mapping ====================
    public Bill MapCreateBillVMToBill(CreateBillVM createBillVM)
    {
        return new Bill
        {
            UserId = createBillVM.UserId,
            BillFromId = createBillVM.BillFromId,
            BillToId = createBillVM.BillToId,
            InvoiceNumber = createBillVM.InvoiceNumber,
            Client = createBillVM.Client,
            IssueDate = createBillVM.IssueDate,
            DueDate = createBillVM.DueDate,
            GstRate = createBillVM.GstRate,
            TdsPercent = createBillVM.TdsPercent,
            Subtotal = createBillVM.Subtotal,
            GstAmount = createBillVM.GstAmount,
            TotalAmount = createBillVM.TotalAmount,
            BillItems = createBillVM.BillItems ?? new List<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Bill MapUpdateBillVMToBill(UpdateBillVM updateBillVM, Bill existingBill)
    {
        existingBill.BillFromId = updateBillVM.BillFromId;
        existingBill.BillToId = updateBillVM.BillToId;
        existingBill.InvoiceNumber = updateBillVM.InvoiceNumber;
        existingBill.Client = updateBillVM.Client;
        existingBill.IssueDate = updateBillVM.IssueDate;
        existingBill.DueDate = updateBillVM.DueDate;
        existingBill.GstRate = updateBillVM.GstRate;
        existingBill.TdsPercent = updateBillVM.TdsPercent;
        existingBill.Subtotal = updateBillVM.Subtotal;
        existingBill.GstAmount = updateBillVM.GstAmount;
        existingBill.TotalAmount = updateBillVM.TotalAmount;
        existingBill.BillItems = updateBillVM.BillItems ?? new List<string>();
        existingBill.UpdatedAt = DateTime.UtcNow;
        return existingBill;
    }

    public BillResponseVM MapBillToBillResponseVM(Bill bill)
    {
        return new BillResponseVM
        {
            BillId = bill.BillId,
            UserId = bill.UserId,
            BillFromId = bill.BillFromId,
            BillToId = bill.BillToId,
            InvoiceNumber = bill.InvoiceNumber,
            Client = bill.Client,
            IssueDate = bill.IssueDate,
            DueDate = bill.DueDate,
            GstRate = bill.GstRate,
            TdsPercent = bill.TdsPercent,
            Subtotal = bill.Subtotal,
            GstAmount = bill.GstAmount,
            TotalAmount = bill.TotalAmount,
            BillItems = bill.BillItems,
            CreatedAt = bill.CreatedAt,
            UpdatedAt = bill.UpdatedAt
        };
    }

    // ==================== BillCompany Mapping ====================
    public BillCompany MapCreateBillCompanyVMToBillCompany(CreateBillCompanyVM createBillCompanyVM)
    {
        return new BillCompany
        {
            UserId = createBillCompanyVM.UserId,
            Name = createBillCompanyVM.Name,
            Address = createBillCompanyVM.Address,
            Gstin = createBillCompanyVM.Gstin,
            Pan = createBillCompanyVM.Pan,
            TdsPercent = createBillCompanyVM.TdsPercent,
            Email = createBillCompanyVM.Email,
            Phone = createBillCompanyVM.Phone,
            AccountName = createBillCompanyVM.AccountName,
            AccountNumber = createBillCompanyVM.AccountNumber,
            IfscCode = createBillCompanyVM.IfscCode,
            LogoUrl = createBillCompanyVM.LogoUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public BillCompany MapUpdateBillCompanyVMToBillCompany(UpdateBillCompanyVM updateBillCompanyVM, BillCompany existingBillCompany)
    {
        existingBillCompany.Name = updateBillCompanyVM.Name;
        existingBillCompany.Address = updateBillCompanyVM.Address;
        existingBillCompany.Gstin = updateBillCompanyVM.Gstin;
        existingBillCompany.Pan = updateBillCompanyVM.Pan;
        existingBillCompany.TdsPercent = updateBillCompanyVM.TdsPercent;
        existingBillCompany.Email = updateBillCompanyVM.Email;
        existingBillCompany.Phone = updateBillCompanyVM.Phone;
        existingBillCompany.AccountName = updateBillCompanyVM.AccountName;
        existingBillCompany.AccountNumber = updateBillCompanyVM.AccountNumber;
        existingBillCompany.IfscCode = updateBillCompanyVM.IfscCode;
        existingBillCompany.LogoUrl = updateBillCompanyVM.LogoUrl;
        existingBillCompany.UpdatedAt = DateTime.UtcNow;
        return existingBillCompany;
    }

    public BillCompanyResponseVM MapBillCompanyToBillCompanyResponseVM(BillCompany billCompany)
    {
        return new BillCompanyResponseVM
        {
            BillCompanyId = billCompany.BillCompanyId,
            UserId = billCompany.UserId,
            Name = billCompany.Name,
            Address = billCompany.Address,
            Gstin = billCompany.Gstin,
            Pan = billCompany.Pan,
            TdsPercent = billCompany.TdsPercent,
            Email = billCompany.Email,
            Phone = billCompany.Phone,
            AccountName = billCompany.AccountName,
            AccountNumber = billCompany.AccountNumber,
            IfscCode = billCompany.IfscCode,
            LogoUrl = billCompany.LogoUrl,
            CreatedAt = billCompany.CreatedAt,
            UpdatedAt = billCompany.UpdatedAt
        };
    }

    // ==================== Debt Mapping ====================
    public Debt MapCreateDebtVMToDebt(CreateDebtVM createDebtVM)
    {
        return new Debt
        {
            UserId = createDebtVM.UserId,
            PersonName = createDebtVM.PersonName,
            Amount = createDebtVM.Amount,
            DebtType = createDebtVM.DebtType,
            Date = createDebtVM.Date,
            DueDate = createDebtVM.DueDate,
            Notes = createDebtVM.Notes,
            Status = createDebtVM.Status,
            PaidAmount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Debt MapUpdateDebtVMToDebt(UpdateDebtVM updateDebtVM, Debt existingDebt)
    {
        existingDebt.PersonName = updateDebtVM.PersonName;
        existingDebt.Amount = updateDebtVM.Amount;
        existingDebt.DebtType = updateDebtVM.DebtType;
        existingDebt.Date = updateDebtVM.Date;
        existingDebt.DueDate = updateDebtVM.DueDate;
        existingDebt.Notes = updateDebtVM.Notes;
        existingDebt.Status = updateDebtVM.Status;
        existingDebt.PaidAmount = updateDebtVM.PaidAmount;
        existingDebt.UpdatedAt = DateTime.UtcNow;
        return existingDebt;
    }

    public DebtResponseVM MapDebtToDebtResponseVM(Debt debt)
    {
        return new DebtResponseVM
        {
            DebtId = debt.DebtId,
            UserId = debt.UserId,
            PersonName = debt.PersonName,
            Amount = debt.Amount,
            DebtType = debt.DebtType,
            Date = debt.Date,
            DueDate = debt.DueDate,
            Notes = debt.Notes,
            Status = debt.Status,
            PaidAmount = debt.PaidAmount,
            CreatedAt = debt.CreatedAt,
            UpdatedAt = debt.UpdatedAt
        };
    }

    // ==================== Investment Mapping ====================
    public Investment MapCreateInvestmentVMToInvestment(CreateInvestmentVM createInvestmentVM)
    {
        return new Investment
        {
            UserId = createInvestmentVM.UserId,
            Name = createInvestmentVM.Name,
            Type = Enum.Parse<InvestmentType>(createInvestmentVM.Type),
            InitialAmount = createInvestmentVM.InitialAmount,
            CurrentValue = createInvestmentVM.CurrentValue,
            DateAcquired = createInvestmentVM.DateAcquired,
            Notes = createInvestmentVM.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Investment MapUpdateInvestmentVMToInvestment(UpdateInvestmentVM updateInvestmentVM, Investment existingInvestment)
    {
        existingInvestment.Name = updateInvestmentVM.Name;
        existingInvestment.Type = Enum.Parse<InvestmentType>(updateInvestmentVM.Type);
        existingInvestment.InitialAmount = updateInvestmentVM.InitialAmount;
        existingInvestment.CurrentValue = updateInvestmentVM.CurrentValue;
        existingInvestment.DateAcquired = updateInvestmentVM.DateAcquired;
        existingInvestment.Notes = updateInvestmentVM.Notes;
        existingInvestment.UpdatedAt = DateTime.UtcNow;
        return existingInvestment;
    }

    public InvestmentResponseVM MapInvestmentToInvestmentResponseVM(Investment investment)
    {
        var gainLoss = investment.CurrentValue - investment.InitialAmount;
        var gainLossPercentage = investment.InitialAmount != 0 ? (gainLoss / investment.InitialAmount) * 100 : 0;

        return new InvestmentResponseVM
        {
            InvestmentId = investment.InvestmentId,
            UserId = investment.UserId,
            Name = investment.Name,
            Type = investment.Type.ToString(),
            InitialAmount = investment.InitialAmount,
            CurrentValue = investment.CurrentValue,
            GainLoss = gainLoss,
            GainLossPercentage = gainLossPercentage,
            DateAcquired = investment.DateAcquired,
            Notes = investment.Notes,
            CreatedAt = investment.CreatedAt,
            UpdatedAt = investment.UpdatedAt
        };
    }
}
