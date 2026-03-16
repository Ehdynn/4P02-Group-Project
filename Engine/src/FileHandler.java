import java.io.*;
import java.nio.file.Files;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**Handles the movement of files, including compression/incryption and decompression/decryption.
 *
 */
public class FileHandler {

    /**Zips inputted file
     *
     * @param fileToZip File to Zip
     * @return  Zipped File
     * @throws IOException  Null file is passed in
     */
    public File zipFile(File fileToZip) throws IOException {
        FileInputStream fileInputStream = new FileInputStream(fileToZip);
        ZipEntry zipEntry = new ZipEntry(fileToZip.getName());
        FileOutputStream fos = new FileOutputStream("Engine/src/resources/zipped/compressed.zip");
        ZipOutputStream zipOut = new ZipOutputStream(fos);
        zipOut.putNextEntry(zipEntry);

        byte[] bytes = new byte[1024];
        int length;
        while((length = fileInputStream.read(bytes)) >= 0) {
            zipOut.write(bytes, 0, length);
        }

        zipOut.close();
        fileInputStream.close();
        fos.close();
        return null;
    }

    /**Unzips selected file
     *
     * @param fileToUnzip   File to be unzipped
     * @return  unzipped File
     * @throws IOException
     */
    public File unzipFile(File fileToUnzip) throws IOException {
        String fileZip = fileToUnzip.getName();
        File destDir = new File("Engine/src/resources/unzipped");

        byte[] buffer = new byte[1024];
        ZipInputStream zis = new ZipInputStream(new FileInputStream(fileZip));
        ZipEntry zipEntry = zis.getNextEntry();
        while (zipEntry != null) {
            File newFile = newFile(destDir, zipEntry);
            if (zipEntry.isDirectory()) {
                if (!newFile.isDirectory() && !newFile.mkdirs()) {
                    throw new IOException("Failed to create directory " + newFile);
                }
            } else {
                // fix for Windows-created archives
                File parent = newFile.getParentFile();
                if (!parent.isDirectory() && !parent.mkdirs()) {
                    throw new IOException("Failed to create directory " + parent);
                }

                // write file content
                FileOutputStream fos = new FileOutputStream(newFile);
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
            }
            zipEntry = zis.getNextEntry();
        }

        zis.closeEntry();
        zis.close();
        return destDir;
    }

    private File newFile(File destinationDir, ZipEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());

        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();

        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
        }

        return destFile;
    }

    /**Gets the file extension from a file's name
     * e.g. "file.txt" returns "txt"
     *
     * @param fileName  Filename to extract the extension from
     * @return  String containing extension
     */
    private static String getFileExtension(String fileName) {
        int lastIndexOfDot = fileName.lastIndexOf('.');
        // Check if a dot exists and is not the very first character
        if (lastIndexOfDot == -1 || lastIndexOfDot == 0) {
            return ""; // No extension found
        }
        return fileName.substring(lastIndexOfDot + 1);
    }


    /**Takes a file input, and gets the text content and file type out
     * For converting source code to a usable format
     *
     * @param file  Source code file
     * @return  SourceCode record that stores the content as a string, and the language as a Language enum
     * @throws IOException  if File is empty
     */
    public SourceCode getSourceCode(File file) throws IOException {
        String filename = file.getName();
        String content = Files.readString(file.toPath());
        return switch (getFileExtension(filename)) {
            case "py" -> new SourceCode(Language.Python, content);
            case "java" -> new SourceCode(Language.Java, content);
            case "c" -> new SourceCode(Language.C, content);
            case "cpp" -> new SourceCode(Language.CPP, content);
            default -> null;
        };
    }

    static void main() throws IOException {
        FileHandler f = new FileHandler();
        File unzip = new File("compressed.zip");
        f.unzipFile(unzip);
        String sourceFile = "Engine/src/resources/unzipped/test1.txt";
        File file = new File(sourceFile);
        f.zipFile(file);
    }

}
