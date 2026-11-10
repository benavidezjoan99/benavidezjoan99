namespace ADAPlusListManager.Core.Interfaces;

/// <summary>
/// Placeholder for a future authorized ADA+ server connector.
/// No endpoints are known; do not invent API calls.
/// </summary>
public interface IAuthorizedAdaConnector
{
    bool IsConfigured { get; }
    string StatusMessage { get; }
    Task EnsureConfiguredAsync(CancellationToken cancellationToken = default);
}
