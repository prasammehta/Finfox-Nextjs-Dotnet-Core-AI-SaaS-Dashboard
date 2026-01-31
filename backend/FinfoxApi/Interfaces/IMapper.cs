namespace FinfoxApi.Interfaces;

using FinfoxApi.Models;
using FinfoxApi.ViewModels;

/// <summary>
/// Mapper interface for converting between Models and ViewModels.
/// Centralizes all entity-to-viewmodel mapping logic and enum conversions.
/// </summary>
public interface IMapper
{
    // ==================== User Mapping ====================
    User MapCreateUserVMToUser(CreateUserVM createUserVM);
    User MapUpdateUserVMToUser(UpdateUserVM updateUserVM, User existingUser);
    UserResponseVM MapUserToUserResponseVM(User user);

    // ==================== Account Mapping ====================
    Account MapCreateAccountVMToAccount(CreateAccountVM createAccountVM);
    Account MapUpdateAccountVMToAccount(UpdateAccountVM updateAccountVM, Account existingAccount);
    AccountResponseVM MapAccountToAccountResponseVM(Account account);

    // ==================== Transaction Mapping ====================
    Transaction MapCreateTransactionVMToTransaction(CreateTransactionVM createTransactionVM);
    Transaction MapUpdateTransactionVMToTransaction(UpdateTransactionVM updateTransactionVM, Transaction existingTransaction);
    TransactionResponseVM MapTransactionToTransactionResponseVM(Transaction transaction);

    // ==================== RecurringTransaction Mapping ====================
    RecurringTransaction MapCreateRecurringTransactionVMToRecurringTransaction(CreateRecurringTransactionVM createRecurringTransactionVM);
    RecurringTransaction MapUpdateRecurringTransactionVMToRecurringTransaction(UpdateRecurringTransactionVM updateRecurringTransactionVM, RecurringTransaction existingRecurringTransaction);
    RecurringTransactionResponseVM MapRecurringTransactionToRecurringTransactionResponseVM(RecurringTransaction recurringTransaction);

    // ==================== Bill Mapping ====================
    Bill MapCreateBillVMToBill(CreateBillVM createBillVM);
    Bill MapUpdateBillVMToBill(UpdateBillVM updateBillVM, Bill existingBill);
    BillResponseVM MapBillToBillResponseVM(Bill bill);

    // ==================== Bill Company Mapping ====================
    BillCompany MapCreateBillCompanyVMToBillCompany(CreateBillCompanyVM createBillCompanyVM);
    BillCompany MapUpdateBillCompanyVMToBillCompany(UpdateBillCompanyVM updateBillCompanyVM, BillCompany existingBillCompany);
    BillCompanyResponseVM MapBillCompanyToBillCompanyResponseVM(BillCompany billCompany);

    // ==================== Debt Mapping ====================
    Debt MapCreateDebtVMToDebt(CreateDebtVM createDebtVM);
    Debt MapUpdateDebtVMToDebt(UpdateDebtVM updateDebtVM, Debt existingDebt);
    DebtResponseVM MapDebtToDebtResponseVM(Debt debt);

    // ==================== Investment Mapping ====================
    Investment MapCreateInvestmentVMToInvestment(CreateInvestmentVM createInvestmentVM);
    Investment MapUpdateInvestmentVMToInvestment(UpdateInvestmentVM updateInvestmentVM, Investment existingInvestment);
    InvestmentResponseVM MapInvestmentToInvestmentResponseVM(Investment investment);
}
