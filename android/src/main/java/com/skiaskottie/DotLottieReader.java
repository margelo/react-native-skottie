package com.skiaskottie;

import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;


public class DotLottieReader {
  private static final String TAG = DotLottieReader.class.getSimpleName();

  public static String readDotLottie(String uri) throws Exception {
    Log.i(TAG, "Reading dotLottie from " + uri);

    // Create an input stream to the file
    InputStream in = null;
    try {
      if (uri.startsWith("http")) {
        // Handle network resource
        URL url = new URL(uri);
        in = url.openStream();
      } else {
        // Handle local file
        File file = new File(uri);
        in = new FileInputStream(file);
      }
    } catch (Exception e) {
      Log.e(TAG, "Failed to read dotLottie from " + uri, e);
      throw e;
    }

    // Read the zip data (dotLottie is just a zip file)
    try (ZipInputStream zipInputStream = new ZipInputStream(in)) {
      ZipEntry entry;

      // Iterate over the zip entries
      while ((entry = zipInputStream.getNextEntry()) != null) {
        String entryName = entry.getName();

        // Right now we skip any other file, and only read the animations/data.json file
        if (!entryName.equals("animations/data.json")) {
          zipInputStream.closeEntry();
          continue;
        }

        // Read the data.json file: Use a StringBuilder to accumulate the file contents
        StringBuilder stringBuilder = new StringBuilder();
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(zipInputStream))) {
          String line;
          while ((line = bufferedReader.readLine()) != null) {
            stringBuilder.append(line);
          }
        }
        String jsonContent = stringBuilder.toString();

        Log.i(TAG, "Read dotLottie from " + uri);
        Log.d(TAG, jsonContent);

        return jsonContent;
      }
    } catch (IOException e) {
      // Handle exceptions
      Log.e(TAG, "Failed to read dotLottie from " + uri, e);
      throw e;
    } finally {
      in.close();
    }

    throw new Exception("Failed to read dotLottie. We expected a animations/data.json file in the zip/dotLottie file.");
  }
}
