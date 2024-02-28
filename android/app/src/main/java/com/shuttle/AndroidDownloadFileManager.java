package com.shuttle;

import static android.Manifest.permission.READ_EXTERNAL_STORAGE;
import static android.Manifest.permission.WRITE_EXTERNAL_STORAGE;

import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class AndroidDownloadFileManager extends ReactContextBaseJavaModule {

    AndroidDownloadFileManager(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AndroidDownloadFileManager";
    }

    @ReactMethod
    public void downloadFileToPublicDownloadDirectory(String fileName,String fileContent, Callback errorCallback, Callback successCallback) {
        if (Build.VERSION.SDK_INT >= 30) {
            File root = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            root = new File(root , fileName);
            try {
                FileOutputStream fout = new FileOutputStream(root);
                fout.write(fileContent.getBytes());
                fout.close();
                successCallback.invoke("File created",101);
            } catch (FileNotFoundException e) {
                e.printStackTrace();

                boolean bool = false;
                try {
                    // try to create the file
                    bool = root.createNewFile();
                } catch (IOException ex) {
                    ex.printStackTrace();
                }

                if (bool){
                    // call the method again
//                saveData()
                    successCallback.invoke("File created",101);
                }else {
                    errorCallback.invoke("Failed to create file",102);
                }
            } catch (IOException e) {
                errorCallback.invoke("Something Went Wrong Please Try Again",103);
                e.printStackTrace();
            }
        } else {
            errorCallback.invoke("Build version is 30 below",104);
        }
    }

}
