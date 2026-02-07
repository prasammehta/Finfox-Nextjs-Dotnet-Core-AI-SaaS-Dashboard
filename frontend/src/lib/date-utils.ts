/**
 * Formats a date string to local time in the specified format.
 * All backend dates are stored as UTC.
 */
export function formatLocalTime(dateStr: string | Date | undefined, includeTime: boolean = false): string {
    if (!dateStr) return "—"

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "Invalid Date"

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }

    if (includeTime) {
        options.hour = "2-digit"
        options.minute = "2-digit"
        options.second = "2-digit"
        return date.toLocaleString("en-IN", options)
    }

    return date.toLocaleDateString("en-IN", options)
}

/**
 * Returns the current local date in YYYY-MM-DD format.
 */
export function getLocalDateString(): string {
    return new Date().toLocaleDateString('en-CA')
}

/**
 * Converts a local date string (YYYY-MM-DD) to a UTC ISO string at midnight.
 */
export function toUtcMidnight(dateStr: string): string {
    return `${dateStr}T00:00:00Z`
}
