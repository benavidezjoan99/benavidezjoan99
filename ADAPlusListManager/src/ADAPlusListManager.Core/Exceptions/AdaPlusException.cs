namespace ADAPlusListManager.Core.Exceptions;

public class AdaPlusException : Exception
{
    public string UserMessage { get; }

    public AdaPlusException(string userMessage, string? technicalMessage = null, Exception? inner = null)
        : base(technicalMessage ?? userMessage, inner)
    {
        UserMessage = userMessage;
    }
}

public sealed class DeviceNotFoundException : AdaPlusException
{
    public DeviceNotFoundException()
        : base("No se encontró ningún dispositivo Zebra compatible. Verifica el cable USB y desbloquea el dispositivo.")
    {
    }
}

public sealed class MtpUnavailableException : AdaPlusException
{
    public MtpUnavailableException()
        : base("Windows detectó el dispositivo, pero el almacenamiento no está disponible. Comprueba el modo de transferencia USB.")
    {
    }
}

public sealed class MangoFolderNotFoundException : AdaPlusException
{
    public MangoFolderNotFoundException()
        : base("No se encontró la carpeta Mango en el almacenamiento compartido del dispositivo.")
    {
    }
}

public sealed class LastRepoNotFoundException : AdaPlusException
{
    public LastRepoNotFoundException()
        : base("No se encontró lastRepo.json en la carpeta Mango.")
    {
    }
}

public sealed class InvalidListFileException : AdaPlusException
{
    public InvalidListFileException(string? detail = null)
        : base(
            "Se encontró el archivo, pero su contenido no pudo interpretarse como un listado compatible.",
            detail)
    {
    }
}

public sealed class TransferInterruptedException : AdaPlusException
{
    public TransferInterruptedException()
        : base("La transferencia del archivo se interrumpió. Verifica el cable USB e inténtalo de nuevo.")
    {
    }
}

public sealed class PrinterUnavailableException : AdaPlusException
{
    public PrinterUnavailableException()
        : base("No se encontró una impresora disponible. Selecciona otra impresora o exporta el listado a PDF.")
    {
    }
}
