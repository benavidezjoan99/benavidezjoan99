using System.Windows;
using System.Windows.Controls;
using ADAPlusListManager.Desktop.ViewModels;

namespace ADAPlusListManager.Desktop.Views;

public partial class HomeView : UserControl
{
    public HomeView() => InitializeComponent();

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        if (DataContext is HomeViewModel vm)
            await vm.RefreshCommand.ExecuteAsync(null);
    }
}
