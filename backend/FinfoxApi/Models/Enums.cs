namespace FinfoxApi.Models;

public enum UserRole
{
    User,
    Admin
}

public enum TransactionType
{
    INCOME,
    EXPENSE,
    TRANSFER
}

public enum RecurringTransactionType
{
    INCOME,
    EXPENSE
}

public enum Frequency
{
    ONCE,
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY
}

public enum InvestmentType
{
    STOCK,
    CRYPTO,
    REAL_ESTATE,
    MUTUAL_FUND,
    BOND,
    OTHER
}

public enum Category
{
    SALARY,
    FREELANCE,
    INVESTMENT_INCOME,
    GIFT_RECEIVED,
    OTHER_INCOME,
    FOOD,
    TRANSPORTATION,
    HOUSING,
    UTILITIES,
    ENTERTAINMENT,
    SHOPPING,
    HEALTH,
    EDUCATION,
    PERSONAL_CARE,
    DEBT_PAYMENT,
    INSURANCE,
    TRAVEL,
    GIFTS,
    DONATIONS,
    OTHER_EXPENSE,
    BANK_TRANSFER,
    WALLET_TOPUP,
    CREDIT_CARD_PAYMENT,
    LOAN_REPAYMENT,
    INVESTMENT_TRANSFER
}

public enum BotType
{
    FINFOX_ADVICER,
    TRANSACTION_HELPER
}
