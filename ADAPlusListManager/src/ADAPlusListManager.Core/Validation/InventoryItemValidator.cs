using ADAPlusListManager.Core.Models;

namespace ADAPlusListManager.Core.Validation;

public static class InventoryItemValidator
{
    public static IReadOnlyList<string> Validate(InventoryItem item)
    {
        var warnings = new List<string>();
        if (string.IsNullOrWhiteSpace(item.Barcode)
            && string.IsNullOrWhiteSpace(item.Reference)
            && string.IsNullOrWhiteSpace(item.Description))
        {
            warnings.Add("Registro sin código, referencia ni descripción identificable.");
        }

        if (!item.Quantity.HasValue)
        {
            warnings.Add("Cantidad no verificada (campo ausente o no interpretable).");
        }

        return warnings;
    }
}
