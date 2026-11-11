using System.Windows;
using System.Windows.Controls;
using ADAPlusListManager.Desktop.ViewModels;
namespace ADAPlusListManager.Desktop.Views;
public partial class ListsView : UserControl
{
    public ListsView() => InitializeComponent();
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is ListsViewModel vm) await vm.ReloadCommand.ExecuteAsync(null);
    }
}
