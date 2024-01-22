package io.ssap.pinmicro;

import android.widget.Toast;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import android.content.Intent;
import android.content.Context;
import android.app.Activity;
import android.app.Application;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
//import java.util.*;

import android.os.Bundle;
import org.apache.cordova.*;
import androidx.appcompat.app.AppCompatActivity;
import android.util.Log;

import com.pinmicro.coresdk.*;
import com.pinmicro.gpssdk.*;
import com.pinmicro.blesdk.*;

import com.pinmicro.blesdk.scanning.*;
// import com.pinmicro.coresdk.logging;
import com.pinmicro.coresdk.logging.ScanNotifier;

import com.pinmicro.coresdk.initialization.SdkMode;
import com.pinmicro.coresdk.initialization.InitializationCallback;

import android.os.PowerManager;
import android.net.Uri;
import android.provider.Settings;
/**
 * This class echoes a string called from JavaScript.
 */
public class PinMicro extends CordovaPlugin {
	private CallbackContext sdkCallbackContext = null;

	@Override
	public boolean execute(String action, String args, final CallbackContext callbackContext) throws JSONException {
		if(action.equals("beaconInitialize")){
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					beaconInitialize(args, callbackContext);
				}
			});
			return true;
		}
		if(action.equals("startScanning")){
			//startScanning();
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					startScanning(callbackContext);
				}
			});
			return true;
		}
		if(action.equals("stopScanning")){
			//stopScanning();
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					stopScanning();
				}
			});
			return true;
		}
		if(action.equals("resetSDK")){
			//stopScanning();
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					resetSDK();
				}
			});
			return true;
		}
		if(action.equals("disableBattery")){
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					disableBattery();
				}
			});
			return true;
		}
		return false;
	}

	public void beaconInitialize(String referenceId, final CallbackContext callbackContext){
		Context context = this.cordova.getActivity().getApplicationContext();
		BLEModuleManager.getInstance(context).init(SdkMode.WITH_SERVER,
			"5e1ee66fc12750a3ac680587cb364f10",
			"5cc08898b56e5bd65067e6b77f45c7b5",
			referenceId,
			new long[]{7985},
			new InitializationCallback() {
				@Override
				public void onInitializationSuccess() {
					Toast.makeText(webView.getContext(),  "RLAP Initialize Successful", Toast.LENGTH_LONG).show();
					System.out.println("SDK Init Success");
					JSONObject data = new JSONObject();
					JSONArray devicesData = new JSONArray();
					devicesData.put("RLAP Initialize Successful");
					addProperty(data, "eventType", "onInitializationSuccess");
					addProperty(data, "onInitializationSuccess", devicesData);
					PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, data.toString());
					callbackContext.sendPluginResult(pluginResult);
				}
				@Override
				public void onInitializationFailure(CoreSDKError error) {
					Toast.makeText(webView.getContext(),  "RLAP Initialize Failed", Toast.LENGTH_LONG).show();
					System.out.println("SDK Init Failed");
					Log.e("SDK", error.getMessage());
					//Toast.makeText(webView.getContext(),  error.getErrorCode() + error.getMessage(), Toast.LENGTH_SHORT).show();
					JSONObject data = new JSONObject();
					JSONArray devicesData = new JSONArray();
					devicesData.put("RLAP Initialize Failed");
					addProperty(data, "eventType", "onInitializationFailure");
					addProperty(data, "onInitializationFailure", devicesData);
					PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, data.toString());
					callbackContext.sendPluginResult(pluginResult);
				}
			}
		);
	}

	public void resetSDK() {
		Context context = this.cordova.getActivity().getApplication();
		BLEModuleManager bleModuleManager = BLEModuleManager.getInstance(context);
		bleModuleManager.resetSDK();
	}

	public void disableBattery() {
		Context context = this.cordova.getActivity().getApplicationContext();
		String packageName = context.getPackageName();
		PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
		Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
		intent.addCategory(Intent.CATEGORY_DEFAULT);
		intent.setData(Uri.parse("package:" + context.getPackageName()));
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
		intent.addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
		context.startActivity(intent);
	}

	public void startScanning(final CallbackContext callbackContext) {
		Context context = this.cordova.getActivity().getApplicationContext();
		ScanNotifier scanNotifier = new ScanNotifier() {
			@Override
			public void onStartScanning(long deploymentId) {
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				devicesData.put(true);
				addProperty(data, "eventType", "onStartScanning");
				addProperty(data, "onStartScanning", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data.toString());
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onStopScanning(long deploymentId) {
				System.out.println("onStopScanning");
				callbackContext.success();
			}
			@Override
			public void onSpotEntry(BPDevice device) {
				Log.d("Scanning", "Spot Name : " + device.getSpotName());
				Log.d("Scanning", "Spot Id : " + device.getSpotId());
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				devicesData.put(device.getSpotId());
				addProperty(data, "eventType", "onSpotEntry");
				addProperty(data, "onSpotEntry", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data.toString());
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onZoneChanged(BPDevice device) {}
			@Override
			public void onSpotExit(BPDevice device) {
				Log.d("Scanning", "Spot Name : " + device.getSpotName());
				Log.d("Scanning", "Spot Id : " + device.getSpotId());
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				devicesData.put(device.getSpotId());
				addProperty(data, "eventType", "onSpotExit");
				addProperty(data, "onSpotExit", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data.toString());
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onScanResult(java.util.ArrayList<BPDevice> devices) {
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				for (BPDevice device : devices) {
					devicesData.put(device.getSpotId());
				}
				addProperty(data, "eventType", "onScanResult");
				addProperty(data, "onScanResult", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data.toString());
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onFoundBeacon(BPDevice device) {
				Log.d("Scanning", "Spot Name : " + device.getSpotName());
				Log.d("Scanning", "Spot Id : " + device.getSpotId());
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				devicesData.put(device.getSpotId());
				addProperty(data, "eventType", "onFoundBeacon");
				addProperty(data, "onFoundBeacon", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, data.toString());
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onScanFailure(CoreSDKError coreSDKError, long l) {
				JSONObject data = new JSONObject();
				JSONArray devicesData = new JSONArray();
				devicesData.put(coreSDKError);
				addProperty(data, "eventType", "onScanFailure");
				addProperty(data, "onScanFailure", devicesData);
				PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, data.toString());
				pluginResult.setKeepCallback(false);
				callbackContext.sendPluginResult(pluginResult);
			}
			@Override
			public void onGpsPointUpdate(GPSPoint gpsPoint) {}
		};
		BLEModuleManager.getInstance(context).startScanning(7985, scanNotifier);
	}

	public void stopScanning(){
		Context context = this.cordova.getActivity().getApplicationContext();
		ScanNotifier scanNotifier = new ScanNotifier() {
			@Override
			public void onStopScanning(long deploymentId) {}
			@Override
			public void onStartScanning(long deploymentId) {}
			@Override
			public void onSpotEntry(BPDevice bpDevice) {}
			@Override
			public void onZoneChanged(BPDevice bpDevice) {}
			@Override
			public void onSpotExit(BPDevice bpDevice) {}
			@Override
			public void onScanResult(java.util.ArrayList<BPDevice> arrayList) {	}
			@Override
			public void onFoundBeacon(BPDevice bpDevice) {}
			@Override
			public void onScanFailure(CoreSDKError coreSDKError, long l) {}
			@Override
			public void onGpsPointUpdate(GPSPoint gpsPoint) {}
		};
		BLEModuleManager.getInstance(context).stopScanning(7985, scanNotifier);
	}

	private void addProperty(JSONObject obj, String key, Object value) {
		try {
			if (value == null) {
				obj.put(key, JSONObject.NULL);
			} else {
				obj.put(key, value);
			}
		} catch (JSONException ignored) {
			//Believe exception only occurs when adding duplicate keys, so just ignore it
		}
	}
}
