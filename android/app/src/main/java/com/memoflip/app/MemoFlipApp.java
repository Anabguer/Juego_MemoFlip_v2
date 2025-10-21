package com.memoflip.app;

import android.app.Application;
import com.google.android.gms.games.PlayGamesSdk;

public class MemoFlipApp extends Application {
    @Override 
    public void onCreate() {
        super.onCreate();
        PlayGamesSdk.initialize(this);
    }
}


