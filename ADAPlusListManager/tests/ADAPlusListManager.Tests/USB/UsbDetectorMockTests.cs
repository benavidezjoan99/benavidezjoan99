using ADAPlusListManager.Core.Interfaces;
using ADAPlusListManager.Core.Models;
using FluentAssertions;
using Moq;

namespace ADAPlusListManager.Tests.USB;

public class UsbDetectorMockTests
{
    [Fact]
    public async Task Detector_NoDevices_ReturnsEmpty()
    {
        var mock = new Mock<IUsbDeviceDetector>();
        mock.Setup(d => d.DetectDevicesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<DeviceInfo>());

        var result = await mock.Object.DetectDevicesAsync();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Detector_Ec50_IsIdentifiable()
    {
        var mock = new Mock<IUsbDeviceDetector>();
        mock.Setup(d => d.FindZebraEc50Async(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeviceInfo
            {
                Id = "dev1",
                FriendlyName = "EC50",
                IsLikelyZebraEc50 = true,
                State = DeviceConnectionState.Detected
            });

        var device = await mock.Object.FindZebraEc50Async();
        device!.IsLikelyZebraEc50.Should().BeTrue();
    }

    [Fact]
    public async Task Mtp_FileNotFound_ReturnsNull()
    {
        var mtp = new Mock<IMtpStorageAccess>();
        mtp.Setup(m => m.FindObjectByPathAsync(It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MtpObjectInfo?)null);

        var obj = await mtp.Object.FindObjectByPathAsync("d", new[] { "Mango", "lastRepo.json" });
        obj.Should().BeNull();
    }
}
