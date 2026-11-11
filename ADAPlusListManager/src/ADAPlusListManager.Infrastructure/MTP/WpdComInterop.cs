using System.Runtime.InteropServices;

namespace ADAPlusListManager.Infrastructure.MTP;

/// <summary>
/// Minimal COM interop for Windows Portable Devices (WPD).
/// Compiles on any OS; activation only succeeds on Windows with WPD installed.
/// </summary>
internal static class WpdGuids
{
    public const string PortableDeviceManager = "0af10cec-2ecd-4b92-9581-34f6ae0637f3";
    public const string PortableDevice = "728a21c5-3d9e-48d7-9810-864848f0e95a";
    public const string PortableDeviceValues = "0c15d503-d017-47ce-9016-7b3f978721cc";
    public const string PortableDeviceKeyCollection = "de2d022d-2480-43be-97f0-d1fa2cf98f4f";
    public const string IPortableDeviceManager = "a1567595-4c9b-4ec4-8d37-d1a8b28f0ec9";
    public const string IPortableDevice = "625e2df8-6392-4aa2-ab04-1b9c1393409b";
    public const string IPortableDeviceContent = "6a96ed84-7c5a-4709-a9a0-624b411d4b4d";
    public const string IEnumPortableDeviceObjectIDs = "10ece955-cf96-452c-b35d-fbdbf18a149f";
    public const string IPortableDeviceProperties = "7f6d695c-03df-4449-827f-2dcc15e42691";
    public const string IPortableDeviceValues = "6848f6f2-9759-4d1c-a8cf-a13ba0a0ee8d";
    public const string IPortableDeviceResources = "fd8877af-35c1-4c2c-a58a-b6f073e2edbe";
    public const string IStream = "0000000c-0000-0000-C000-000000000046";
}

[StructLayout(LayoutKind.Sequential)]
internal struct PropertyKey
{
    public Guid fmtid;
    public uint pid;

    public PropertyKey(Guid fmtid, uint pid)
    {
        this.fmtid = fmtid;
        this.pid = pid;
    }
}

internal static class WpdPropertyKeys
{
    private static readonly Guid ObjectProperties = new("EF6B490D-14FE-42A8-89B0-2A7CDE5A990B");
    private static readonly Guid DeviceProperties = new("26D4979A-E643-4626-9E2B-736DC0C92FDC");

    public static PropertyKey ObjectName => new(ObjectProperties, 4);
    public static PropertyKey ObjectContentType => new(ObjectProperties, 7);
    public static PropertyKey ObjectSize => new(ObjectProperties, 11);
    public static PropertyKey ObjectParentId => new(ObjectProperties, 3);
    public static PropertyKey DeviceFriendlyName => new(DeviceProperties, 12);
    public static PropertyKey DeviceManufacturer => new(DeviceProperties, 7);
    public static PropertyKey DeviceModel => new(DeviceProperties, 8);
}

internal static class WpdContentTypes
{
    public static readonly Guid Folder = new("27E2E151-1EA1-4AB6-B757-4661828A3800");
    public static readonly Guid FunctionalObject = new("99B41276-3687-44F1-A624-F1AC759C0E8D");
}

[ComImport]
[Guid(WpdGuids.IPortableDeviceManager)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDeviceManager
{
    void GetDevices([Out, MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.LPWStr)] string[]? pPnPDeviceIDs, ref uint pcPnPDeviceIDs);
    void RefreshDeviceList();
    void GetDeviceFriendlyName([MarshalAs(UnmanagedType.LPWStr)] string pszPnPDeviceID, IntPtr pDeviceFriendlyName, ref uint pcchDeviceFriendlyName);
    void GetDeviceDescription([MarshalAs(UnmanagedType.LPWStr)] string pszPnPDeviceID, IntPtr pDeviceDescription, ref uint pcchDeviceDescription);
    void GetDeviceManufacturer([MarshalAs(UnmanagedType.LPWStr)] string pszPnPDeviceID, IntPtr pDeviceManufacturer, ref uint pcchDeviceManufacturer);
}

[ComImport]
[Guid(WpdGuids.IPortableDevice)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDevice
{
    void Open([MarshalAs(UnmanagedType.LPWStr)] string pszPnPDeviceID, [MarshalAs(UnmanagedType.Interface)] object pClientInfo);
    void SendCommand([MarshalAs(UnmanagedType.Interface)] object pParameters, [MarshalAs(UnmanagedType.Interface)] out object ppResults);
    void Content([MarshalAs(UnmanagedType.Interface)] out IPortableDeviceContent ppContent);
    void Capabilities([MarshalAs(UnmanagedType.Interface)] out object ppCapabilities);
    void Cancel();
    void Close();
    void Advise(uint dwFlags, [MarshalAs(UnmanagedType.Interface)] object pCallback, [MarshalAs(UnmanagedType.LPWStr)] string? pstrCookie, [MarshalAs(UnmanagedType.LPWStr)] out string? ppszCookie);
    void Unadvise([MarshalAs(UnmanagedType.LPWStr)] string pszCookie);
}

[ComImport]
[Guid(WpdGuids.IPortableDeviceContent)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDeviceContent
{
    void EnumObjects(uint dwFlags, [MarshalAs(UnmanagedType.LPWStr)] string pszParentObjectID, [MarshalAs(UnmanagedType.Interface)] object? pFilter, [MarshalAs(UnmanagedType.Interface)] out IEnumPortableDeviceObjectIDs ppEnum);
    void Properties([MarshalAs(UnmanagedType.Interface)] out IPortableDeviceProperties ppProperties);
    void Transfer([MarshalAs(UnmanagedType.Interface)] out IPortableDeviceResources ppResources);
    void CreateObjectWithPropertiesOnly([MarshalAs(UnmanagedType.Interface)] object pValues, [MarshalAs(UnmanagedType.LPWStr)] ref string ppszObjectID);
    void CreateObjectWithPropertiesAndData([MarshalAs(UnmanagedType.Interface)] object pValues, [MarshalAs(UnmanagedType.Interface)] out object ppData, ref uint pdwOptimalWriteBufferSize, [MarshalAs(UnmanagedType.LPWStr)] ref string? ppszCookie);
    void Delete(uint dwOptions, [MarshalAs(UnmanagedType.Interface)] object pObjectIDs, [MarshalAs(UnmanagedType.Interface)] ref object? ppResults);
    void GetObjectIDsFromPersistentUniqueIDs([MarshalAs(UnmanagedType.Interface)] object pPersistentUniqueIDs, [MarshalAs(UnmanagedType.Interface)] out object ppObjectIDs);
    void Cancel();
    void Move([MarshalAs(UnmanagedType.Interface)] object pObjectIDs, [MarshalAs(UnmanagedType.LPWStr)] string pszDestinationFolderObjectID, [MarshalAs(UnmanagedType.Interface)] ref object? ppResults);
    void Copy([MarshalAs(UnmanagedType.Interface)] object pObjectIDs, [MarshalAs(UnmanagedType.LPWStr)] string pszDestinationFolderObjectID, [MarshalAs(UnmanagedType.Interface)] ref object? ppResults);
}

[ComImport]
[Guid(WpdGuids.IEnumPortableDeviceObjectIDs)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IEnumPortableDeviceObjectIDs
{
    void Next(uint cObjects, [Out, MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.LPWStr, SizeParamIndex = 0)] string[] pObjIDs, ref uint pcFetched);
    void Skip(uint cObjects);
    void Reset();
    void Clone([MarshalAs(UnmanagedType.Interface)] out IEnumPortableDeviceObjectIDs ppEnum);
    void Cancel();
}

[ComImport]
[Guid(WpdGuids.IPortableDeviceProperties)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDeviceProperties
{
    void GetSupportedProperties([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] out object ppKeys);
    void GetPropertyAttributes([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppAttributes);
    void GetValues([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] object? pKeys, [MarshalAs(UnmanagedType.Interface)] out IPortableDeviceValues ppValues);
    void SetValues([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] object pValues, [MarshalAs(UnmanagedType.Interface)] out object ppResults);
    void Delete([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] object pKeys);
    void Cancel();
}

[ComImport]
[Guid(WpdGuids.IPortableDeviceValues)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDeviceValues
{
    void GetCount(ref uint pcelt);
    void GetAt(uint index, ref PropertyKey pKey, IntPtr pValue);
    void SetValue(ref PropertyKey key, IntPtr pValue);
    void GetValue(ref PropertyKey key, IntPtr pValue);
    void SetStringValue(ref PropertyKey key, [MarshalAs(UnmanagedType.LPWStr)] string Value);
    void GetStringValue(ref PropertyKey key, [MarshalAs(UnmanagedType.LPWStr)] out string pValue);
    void SetUnsignedIntegerValue(ref PropertyKey key, uint Value);
    void GetUnsignedIntegerValue(ref PropertyKey key, out uint pValue);
    void SetSignedIntegerValue(ref PropertyKey key, int Value);
    void GetSignedIntegerValue(ref PropertyKey key, out int pValue);
    void SetUnsignedLargeIntegerValue(ref PropertyKey key, ulong Value);
    void GetUnsignedLargeIntegerValue(ref PropertyKey key, out ulong pValue);
    void SetSignedLargeIntegerValue(ref PropertyKey key, long Value);
    void GetSignedLargeIntegerValue(ref PropertyKey key, out long pValue);
    void SetFloatValue(ref PropertyKey key, float Value);
    void GetFloatValue(ref PropertyKey key, out float pValue);
    void SetErrorValue(ref PropertyKey key, int Value);
    void GetErrorValue(ref PropertyKey key, out int pValue);
    void SetKeyValue(ref PropertyKey key, ref PropertyKey Value);
    void GetKeyValue(ref PropertyKey key, out PropertyKey pValue);
    void SetBoolValue(ref PropertyKey key, int Value);
    void GetBoolValue(ref PropertyKey key, out int pValue);
    void SetIUnknownValue(ref PropertyKey key, [MarshalAs(UnmanagedType.IUnknown)] object pValue);
    void GetIUnknownValue(ref PropertyKey key, [MarshalAs(UnmanagedType.IUnknown)] out object ppValue);
    void SetGuidValue(ref PropertyKey key, ref Guid Value);
    void GetGuidValue(ref PropertyKey key, out Guid pValue);
    void SetBufferValue(ref PropertyKey key, IntPtr pValue, uint cbValue);
    void GetBufferValue(ref PropertyKey key, out IntPtr ppValue, out uint pcbValue);
    void SetIPortableDeviceValuesValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] object pValue);
    void GetIPortableDeviceValuesValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppValue);
    void SetIPortableDevicePropVariantCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] object pValue);
    void GetIPortableDevicePropVariantCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppValue);
    void SetIPortableDeviceKeyCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] object pValue);
    void GetIPortableDeviceKeyCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppValue);
    void SetIPortableDeviceValuesCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] object pValue);
    void GetIPortableDeviceValuesCollectionValue(ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppValue);
    void RemoveValue(ref PropertyKey key);
    void CopyValuesFromPropertyStore([MarshalAs(UnmanagedType.Interface)] object pStore);
    void CopyValuesToPropertyStore([MarshalAs(UnmanagedType.Interface)] object pStore);
    void Clear();
}

[ComImport]
[Guid(WpdGuids.IPortableDeviceResources)]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPortableDeviceResources
{
    void GetSupportedResources([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] out object ppKeys);
    void GetResourceAttributes([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, ref PropertyKey key, [MarshalAs(UnmanagedType.Interface)] out object ppResourceAttributes);
    void GetStream([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, ref PropertyKey key, uint dwMode, ref uint pdwOptimalTransferSizeBytes, [MarshalAs(UnmanagedType.Interface)] out object ppStream);
    void Delete([MarshalAs(UnmanagedType.LPWStr)] string pszObjectID, [MarshalAs(UnmanagedType.Interface)] object pKeys);
    void Cancel();
    void CreateResource([MarshalAs(UnmanagedType.Interface)] object pResourceAttributes, [MarshalAs(UnmanagedType.Interface)] out object ppData, ref uint pdwOptimalWriteBufferSize, [MarshalAs(UnmanagedType.LPWStr)] ref string? ppszCookie);
}

[ComImport]
[Guid(WpdGuids.PortableDeviceManager)]
internal class PortableDeviceManagerCom
{
}

[ComImport]
[Guid(WpdGuids.PortableDevice)]
internal class PortableDeviceCom
{
}

[ComImport]
[Guid(WpdGuids.PortableDeviceValues)]
internal class PortableDeviceValuesCom
{
}

[ComImport]
[Guid(WpdGuids.PortableDeviceKeyCollection)]
internal class PortableDeviceKeyCollectionCom
{
}
