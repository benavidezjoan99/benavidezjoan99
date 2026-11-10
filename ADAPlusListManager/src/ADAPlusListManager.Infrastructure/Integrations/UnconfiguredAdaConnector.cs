using ADAPlusListManager.Core.Interfaces;

namespace ADAPlusListManager.Infrastructure.Integrations;

/// <summary>
/// No ADA+ API is documented. This connector stays unconfigured by design.
/// Does not read .p12 certificates or invent endpoints.
/// </summary>
public sealed class UnconfiguredAdaConnector : IAuthorizedAdaConnector
{
    public bool IsConfigured => false;

    public string StatusMessage =>
        "Conectar con servidor ADA+: no configurado. Se requiere documentación y autorización de IT corporativo.";

    public Task EnsureConfiguredAsync(CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
