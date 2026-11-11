using System.Windows;
using System.Windows.Controls;
using ADAPlusListManager.Desktop.ViewModels;
namespace ADAPlusListManager.Desktop.Views;
public partial class HistoryView : UserControl
{
    public HistoryView() => InitializeComponent();
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is HistoryViewModel vm) await vm.ReloadCommand.ExecuteAsync(null);
    }
}
