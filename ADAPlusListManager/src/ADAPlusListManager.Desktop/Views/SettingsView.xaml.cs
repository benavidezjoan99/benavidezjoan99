using System.Windows;
using System.Windows.Controls;
using ADAPlusListManager.Desktop.ViewModels;
namespace ADAPlusListManager.Desktop.Views;
public partial class SettingsView : UserControl
{
    public SettingsView() => InitializeComponent();
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is SettingsViewModel vm) await vm.LoadCommand.ExecuteAsync(null);
    }
}
