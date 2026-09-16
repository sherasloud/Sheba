package com.sheba

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.TelephonyManager
import android.telephony.SubscriptionManager
import androidx.core.app.ActivityCompat

class SIMDetector(private val context: Context) {
    
    data class SIMInfo(
        val phoneNumber: String,
        val carrier: String,
        val simSlot: Int,
        val isActive: Boolean
    )
    
    fun detectSIM(): SIMInfo? {
        // Check for READ_PHONE_STATE permission
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_PHONE_STATE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return null
        }
        
        val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
        
        // Get phone number
        val phoneNumber = telephonyManager.line1Number ?: ""
        
        // Get carrier name
        val carrierName = telephonyManager.networkOperatorName ?: "Unknown"
        
        // Get active subscription
        val activeSubscriptions = subscriptionManager.activeSubscriptionInfoList
        val isActive = activeSubscriptions?.isNotEmpty() == true
        
        return SIMInfo(
            phoneNumber = phoneNumber,
            carrier = carrierName,
            simSlot = 1,
            isActive = isActive
        )
    }
    
    fun lockDeviceToNumber(phoneNumber: String) {
        val prefs = context.getSharedPreferences("sheba_prefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("locked_phone_number", phoneNumber)
            putBoolean("is_device_locked", true)
            apply()
        }
    }
    
    fun getLockedPhoneNumber(): String? {
        val prefs = context.getSharedPreferences("sheba_prefs", Context.MODE_PRIVATE)
        val isLocked = prefs.getBoolean("is_device_locked", false)
        return if (isLocked) {
            prefs.getString("locked_phone_number", null)
        } else {
            null
        }
    }
    
    fun canLoginWithNumber(phoneNumber: String): Boolean {
        val lockedNumber = getLockedPhoneNumber()
        return lockedNumber == null || lockedNumber == phoneNumber
    }
}
