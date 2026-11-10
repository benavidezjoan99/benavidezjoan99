using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class ListsViewModel : PageViewModelBase
{
    private readonly IInventoryRepository _repo;
    private readonly IListFilterService _filters;

    public ObservableCollection<InventoryList> Lists { get; } = new();
    public ObservableCollection<InventoryItem> VisibleItems { get; } = new();

    [ObservableProperty] private InventoryList? _selectedList;
    [ObservableProperty] private string? _search;
    [ObservableProperty] private string? _filterReference;
    [ObservableProperty] private string? _filterSize;
    [ObservableProperty] private string? _filterColor;
    [ObservableProperty] private string _totalsText = "";
    [ObservableProperty] private bool _hasUnknownQuantities;

    public ListsViewModel(IInventoryRepository repo, IListFilterService filters)
    {
        _repo = repo;
        _filters = filters;
    }

    partial void OnSelectedListChanged(InventoryList? value) => ApplyFilter();
    partial void OnSearchChanged(string? value) => ApplyFilter();
    partial void OnFilterReferenceChanged(string? value) => ApplyFilter();
    partial void OnFilterSizeChanged(string? value) => ApplyFilter();
    partial void OnFilterColorChanged(string? value) => ApplyFilter();

    [RelayCommand]
    private async Task ReloadAsync()
    {
        Lists.Clear();
        var all = await _repo.GetInventoryListsAsync();
        foreach (var l in all) Lists.Add(l);
        SelectedList = Lists.FirstOrDefault();
        Status($"Listados cargados: {Lists.Count}");
    }

    private void ApplyFilter()
    {
        VisibleItems.Clear();
        if (SelectedList is null)
        {
            TotalsText = "";
            HasUnknownQuantities = false;
            return;
        }

        var filtered = _filters.Filter(SelectedList.Items, Search, FilterReference, FilterSize, FilterColor);
        foreach (var i in filtered) VisibleItems.Add(i);
        var totals = _filters.CalculateTotals(filtered);
        HasUnknownQuantities = totals.UnknownQuantityCount > 0;
        TotalsText =
            $"Registros: {totals.RecordCount} | Referencias únicas: {totals.UniqueReferenceCount} | " +
            $"Unidades verificadas: {totals.VerifiedUnitTotal?.ToString() ?? "n/d"} | " +
            $"Cantidades desconocidas: {totals.UnknownQuantityCount}" +
            (SelectedList.IsDemo ? " | MODO DEMOSTRACIÓN" : "");
    }
}
