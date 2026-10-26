# Keep kotlinx.serialization generated serializers.
-keepclassmembers class com.cineconnect.talent.data.model.** {
    *** Companion;
}
-keepclasseswithmembers class com.cineconnect.talent.data.model.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.cineconnect.talent.data.model.**$$serializer { *; }
