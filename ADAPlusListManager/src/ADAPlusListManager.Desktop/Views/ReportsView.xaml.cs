using System.Windows;
using System.Windows.Controls;
using ADAPlusListManager.Desktop.ViewModels;
namespace ADAPlusListManager.Desktop.Views;
public partial class ReportsView : UserControl
{
    public ReportsView() => InitializeComponent();
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is ReportsViewModel vm) await vm.ReloadCommand.ExecuteAsync(null);
    }
}
