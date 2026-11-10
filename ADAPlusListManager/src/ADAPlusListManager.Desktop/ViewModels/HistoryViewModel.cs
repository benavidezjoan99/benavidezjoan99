using System.Collections.ObjectModel;
using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using CommunityToolkit.Mvvm.Input;

namespace ADAPlusListManager.Desktop.ViewModels;

public partial class HistoryViewModel : PageViewModelBase
{
    private readonly IInventoryRepository _repo;
    public ObservableCollection<ImportSession> Sessions { get; } = new();

    public HistoryViewModel(IInventoryRepository repo) => _repo = repo;

    [RelayCommand]
    private async Task ReloadAsync()
    {
        Sessions.Clear();
        foreach (var s in await _repo.GetImportHistoryAsync())
            Sessions.Add(s);
        Status($"Historial: {Sessions.Count}");
    }
}
