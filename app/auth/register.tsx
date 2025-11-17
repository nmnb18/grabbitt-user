import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { BUSINESS_TYPES, CATEGORIES, QR_CODE_TYPES } from '@/utils/constant';
import { isValidPassword } from '@/utils/helper';
import { AppStyles } from '@/utils/theme';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    Checkbox,
    Chip,
    HelperText,
    RadioButton,
    Surface,
    Text,
    TextInput
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export default function SellerRegister() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Account & Basic Info
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',

        // Step 2: Business Info
        shopName: '',
        businessType: '',
        category: '',
        description: '',
        establishedYear: '',

        // Step 3: Location
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        enableLocation: false,
        locationRadius: '100',
        latitude: null as number | null,
        longitude: null as number | null,

        // Step 4: Verification (Optional)
        gstNumber: '',
        panNumber: '',
        businessRegistrationNumber: '',

        // Step 5: Preferences
        qrCodeType: 'dynamic',
        defaultPoints: '5',
        subscriptionTier: 'free',
        acceptTerms: false,
    });

    const router = useRouter();
    const { register } = useAuthStore();

    const theme = useTheme();
    const backgroundColor = useThemeColor({}, 'background');
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    // Check location permission on component mount
    useEffect(() => {
        checkLocationPermission();
    }, []);

    const checkLocationPermission = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationPermission(status);
        } catch (error) {
            console.error('Error checking location permission:', error);
        }
    };

    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);

            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'Location access is needed to enable location-based QR code scanning and auto-fill your address.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Location.getForegroundPermissionsAsync() }
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            Alert.alert('Error', 'Failed to request location permission');
            return false;
        } finally {
            setLocationLoading(false);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const geocodedAddress = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (geocodedAddress && geocodedAddress.length > 0) {
                const address = geocodedAddress[0];

                // Update form data with geocoded address
                setFormData(prev => ({
                    ...prev,
                    street: address.street || `${address.name || ''} ${address.streetNumber || ''}`.trim(),
                    city: address.city || address.subregion || '',
                    state: address.region || '',
                    pincode: address.postalCode || '',
                    country: address.country || 'India'
                }));

                setIsAutoFilled(true);

                Alert.alert(
                    'Address Auto-filled',
                    'We\'ve auto-filled your address based on your location. Please review and edit if needed.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            Alert.alert(
                'Auto-fill Warning',
                'We got your location but could not auto-fill the address. Please enter your address manually.'
            );
        }
    };

    const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
        try {
            setLocationLoading(true);

            // Check if we have permission
            if (locationPermission !== 'granted') {
                const hasPermission = await requestLocationPermission();
                if (!hasPermission) return null;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 15000, // 15 seconds timeout
            });

            const { latitude, longitude } = location.coords;

            // Update form data with coordinates
            updateFormData('latitude', latitude);
            updateFormData('longitude', longitude);

            // Reverse geocode to get address
            await reverseGeocode(latitude, longitude);

            return { latitude, longitude };
        } catch (error: any) {
            console.error('Error getting location:', error);

            let errorMessage = 'Failed to get current location';
            if (error.code === 'CANCELLED') {
                errorMessage = 'Location request was cancelled';
            } else if (error.code === 'UNAVAILABLE') {
                errorMessage = 'Location services are not available';
            } else if (error.code === 'TIMEOUT') {
                errorMessage = 'Location request timed out. Please try again';
            }

            Alert.alert('Location Error', errorMessage);
            return null;
        } finally {
            setLocationLoading(false);
        }
    };

    const handleEnableLocationToggle = async () => {
        const newEnableLocation = !formData.enableLocation;

        if (newEnableLocation) {
            // If enabling location, request permission and get coordinates
            const location = await getCurrentLocation();
            if (location) {
                updateFormData('enableLocation', true);
            } else {
                // If location failed, keep it disabled
                updateFormData('enableLocation', false);
            }
        } else {
            // If disabling location, clear coordinates
            updateFormData('enableLocation', false);
            updateFormData('latitude', null);
            updateFormData('longitude', null);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // If user manually edits any address field, mark as not auto-filled
        if (['street', 'city', 'state', 'pincode'].includes(field)) {
            setIsAutoFilled(false);
        }
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.email || !formData.password || !formData.confirmPassword ||
                    !formData.name || !formData.phone) {
                    Alert.alert('Error', 'Please fill all required fields');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    Alert.alert('Error', 'Passwords do not match');
                    return false;
                }
                if (!isValidPassword(formData.password)) {
                    Alert.alert(
                        'Weak Password',
                        'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character.'
                    );
                    return false;
                }
                return true;

            case 2:
                if (!formData.shopName || !formData.businessType || !formData.category || !formData.description) {
                    Alert.alert('Error', 'Please fill all business information');
                    return false;
                }
                return true;

            case 3:
                if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
                    Alert.alert('Error', 'Please fill all address fields');
                    return false;
                }
                if (formData.enableLocation && (!formData.latitude || !formData.longitude)) {
                    Alert.alert('Error', 'Please enable and save your location coordinates');
                    return false;
                }
                return true;

            case 5:
                if (!formData.acceptTerms) {
                    Alert.alert('Error', 'You must accept the terms and conditions');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleRegister = async () => {
        if (!validateStep(5)) return;

        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                shopName: formData.shopName,
                phone: formData.phone,
                businessType: formData.businessType,
                category: formData.category,
                description: formData.description,
                establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country,
                enableLocation: formData.enableLocation,
                locationRadius: formData.enableLocation ? parseInt(formData.locationRadius) : undefined,
                latitude: formData.latitude,
                longitude: formData.longitude,
                gstNumber: formData.gstNumber || undefined,
                panNumber: formData.panNumber || undefined,
                businessRegistrationNumber: formData.businessRegistrationNumber || undefined,
                qrCodeType: formData.qrCodeType,
                defaultPoints: parseInt(formData.defaultPoints),
                subscriptionTier: formData.subscriptionTier,
                acceptTerms: formData.acceptTerms,
            };

            await register(payload);
            Alert.alert('Registration Success', 'Please login with resgitered email id and password to continue.');
            router.push('/auth/login');
        } catch (error: any) {
            Alert.alert('Registration Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Account & Basic Information
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text variant="titleMedium" style={styles.stepTitle}>Account Information</Text>

            <TextInput
                label="Full Name *"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                mode="outlined"
                autoCapitalize="words"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="account" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Phone Number *"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                mode="outlined"
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="phone" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="email" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Password *"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="lock" />}
                right={
                    <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="lock-check" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />
        </View>
    );

    // Step 2: Business Information
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text variant="titleMedium" style={styles.stepTitle}>Business Information</Text>

            <TextInput
                label="Shop/Business Name *"
                value={formData.shopName}
                onChangeText={(value) => updateFormData('shopName', value)}
                mode="outlined"
                autoCapitalize="words"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="store" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <Text variant="bodyMedium" style={styles.sectionLabel}>Business Type *</Text>
            <View style={styles.multiLineContainer}>
                {BUSINESS_TYPES.map((button) => (
                    <Chip
                        key={button.value}
                        selected={formData.businessType === button.value}
                        onPress={() => {
                            updateFormData('businessType', button.value);
                            updateFormData('category', '');
                        }}
                        style={[
                            styles.businessChip,
                            formData.businessType === button.value && styles.selectedChip
                        ]}
                        textStyle={[
                            styles.chipText,
                            formData.businessType === button.value && styles.selectedChipText
                        ]}
                    >
                        {button.label}
                    </Chip>
                ))}
            </View>

            {formData.businessType && (
                <>
                    <Text variant="bodyMedium" style={styles.sectionLabel}>Category *</Text>
                    <View style={styles.multiLineContainer}>
                        {CATEGORIES[formData.businessType as keyof typeof CATEGORIES]?.map((category) => {
                            const categoryValue = category.toLowerCase();
                            const isSelected = formData.category === categoryValue;

                            return (
                                <Chip
                                    key={categoryValue}
                                    selected={isSelected}
                                    onPress={() => updateFormData('category', categoryValue)}
                                    style={[
                                        styles.businessChip,
                                        isSelected && styles.selectedChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        isSelected && styles.selectedChipText
                                    ]}
                                    showSelectedCheck={false}
                                >
                                    {category}
                                </Chip>
                            );
                        }) || []}
                    </View>
                </>
            )}

            <TextInput
                label="Business Description *"
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Established Year (Optional)"
                value={formData.establishedYear}
                onChangeText={(value) => updateFormData('establishedYear', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="calendar" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />
        </View>
    );

    // Step 3: Location Details
    // Step 3: Location Details (Updated with auto-fill functionality)
    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text variant="titleMedium" style={styles.stepTitle}>Location Details</Text>

            {/* Auto-fill Banner */}
            {isAutoFilled && (
                <View style={styles.autoFillBanner}>
                    <Text variant="bodySmall" style={styles.autoFillText}>
                        ✓ Address auto-filled from your location
                    </Text>
                    <Button
                        onPress={() => getCurrentLocation()}
                        variant="text"
                    >
                        Refresh
                    </Button>
                </View>
            )}

            <TextInput
                label="Street Address *"
                value={formData.street}
                onChangeText={(value) => updateFormData('street', value)}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="map-marker" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
                placeholder="Enter your street address"
            />

            <View style={styles.row}>
                <TextInput
                    label="City *"
                    value={formData.city}
                    onChangeText={(value) => updateFormData('city', value)}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    outlineColor={outlineColor}
                    activeOutlineColor={accentColor}
                    theme={theme}
                    placeholder="Enter your city"
                />
                <TextInput
                    label="State *"
                    value={formData.state}
                    onChangeText={(value) => updateFormData('state', value)}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    outlineColor={outlineColor}
                    activeOutlineColor={accentColor}
                    theme={theme}
                    placeholder="Enter your state"
                />
            </View>

            <View style={styles.row}>
                <TextInput
                    label="Pincode *"
                    value={formData.pincode}
                    onChangeText={(value) => updateFormData('pincode', value)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[styles.input, styles.halfInput]}
                    outlineColor={outlineColor}
                    activeOutlineColor={accentColor}
                    theme={theme}
                    placeholder="Enter pincode"
                />
                <TextInput
                    label="Country"
                    value={formData.country}
                    onChangeText={(value) => updateFormData('country', value)}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    outlineColor={outlineColor}
                    activeOutlineColor={accentColor}
                    theme={theme}
                    editable={false}
                />
            </View>

            {/* Manual Location Button */}
            {!formData.enableLocation && (
                <View style={styles.manualLocationSection}>
                    <Button
                        onPress={async () => {
                            const location = await getCurrentLocation();
                            if (location) {
                                updateFormData('enableLocation', true);
                            }
                        }}
                        variant="outlined"
                        size="medium"
                        loading={locationLoading}
                        fullWidth
                    >
                        Auto-fill Address from My Location
                    </Button>
                    <HelperText type="info" style={styles.manualLocationHelper}>
                        We'll use your current location to auto-fill your address and enable location-based QR scanning
                    </HelperText>
                </View>
            )}

            {/* Location Services Section */}
            {formData.enableLocation && (
                <View style={styles.locationSection}>
                    <View style={styles.checkboxContainer}>
                        <Checkbox.Android
                            status={formData.enableLocation ? 'checked' : 'unchecked'}
                            onPress={handleEnableLocationToggle}
                            color={accentColor}
                            disabled={locationLoading}
                        />
                        <View style={styles.locationLabelContainer}>
                            <Text variant="bodyMedium" style={styles.checkboxLabel}>
                                Enable Location-based QR scanning
                            </Text>
                            <Text variant="bodySmall" style={styles.locationDescription}>
                                Allow customers to find and scan your QR codes when they are nearby
                            </Text>
                        </View>
                    </View>

                    <View style={styles.locationDetails}>
                        {formData.latitude && formData.longitude ? (
                            <View style={styles.locationSaved}>
                                <Text variant="bodySmall" style={styles.locationSuccessText}>
                                    ✓ Location saved successfully
                                </Text>
                                <Text variant="bodySmall" style={styles.coordinatesText}>
                                    Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                                </Text>
                                <Button
                                    onPress={getCurrentLocation}
                                    variant="outlined"
                                    loading={locationLoading}
                                >
                                    Update Location
                                </Button>
                            </View>
                        ) : null}

                        <TextInput
                            label="Location Radius (meters)"
                            value={formData.locationRadius}
                            onChangeText={(value) => updateFormData('locationRadius', value)}
                            mode="outlined"
                            keyboardType="numeric"
                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                            outlineColor={outlineColor}
                            activeOutlineColor={accentColor}
                            theme={theme}
                        />
                        <HelperText type='info'>
                            Customers must be within this distance to scan your QR codes (Recommended: 50-200 meters)
                        </HelperText>
                    </View>
                </View>
            )}
        </View>
    );
    // Step 4: Business Verification (Optional)
    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text variant="titleMedium" style={styles.stepTitle}>Business Verification</Text>
            <Text variant="bodySmall" style={styles.optionalText}>(Optional - Can be completed later)</Text>

            <TextInput
                label="GST Number"
                value={formData.gstNumber}
                onChangeText={(value) => updateFormData('gstNumber', value)}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="card-account-details" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="PAN Number"
                value={formData.panNumber}
                onChangeText={(value) => updateFormData('panNumber', value)}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="card-bulleted" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <TextInput
                label="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChangeText={(value) => updateFormData('businessRegistrationNumber', value)}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="file-document" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />
        </View>
    );

    // Step 5: Preferences & Terms
    const renderStep5 = () => (
        <View style={styles.stepContainer}>
            <Text variant="titleMedium" style={styles.stepTitle}>QR Code Preferences</Text>

            <Text variant="bodyMedium" style={styles.sectionLabel}>QR Code Type</Text>
            <RadioButton.Group
                value={formData.qrCodeType}
                onValueChange={(value) => updateFormData('qrCodeType', value)}
            >
                {QR_CODE_TYPES.map(type => (
                    <View key={type.value} style={styles.radioOption}>
                        <RadioButton.Android value={type.value} color={accentColor} />
                        <View style={styles.radioText}>
                            <Text variant="bodyLarge">{type.label}</Text>
                            <Text variant="bodySmall" style={styles.helperText}>
                                {type.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </RadioButton.Group>

            <TextInput
                label="Default Points per Scan"
                value={formData.defaultPoints}
                onChangeText={(value) => updateFormData('defaultPoints', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                left={<TextInput.Icon icon="star" />}
                outlineColor={outlineColor}
                activeOutlineColor={accentColor}
                theme={theme}
            />

            <View style={styles.checkboxContainer}>
                <Checkbox.Android
                    status={formData.acceptTerms ? 'checked' : 'unchecked'}
                    onPress={() => updateFormData('acceptTerms', !formData.acceptTerms)}
                    color={accentColor}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy *
                </Text>
            </View>
        </View>
    );

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4, 5].map(step => (
                <View key={step} style={styles.stepDotContainer}>
                    <View
                        style={[
                            styles.stepDot,
                            step === currentStep && styles.stepDotActive,
                            step < currentStep && styles.stepDotCompleted
                        ]}
                    />
                    {step < 5 && <View style={styles.stepLine} />}
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <GradientText style={{ fontFamily: 'JostMedium', fontSize: 80, marginTop: 40 }}>grabbitt</GradientText>
                        <Text style={[styles.subtitle]}>
                            Seller Registration
                        </Text>
                    </View>

                    <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                        <GradientText style={styles.gradientTitle}>
                            Step {currentStep} of 5
                        </GradientText>

                        {renderStepIndicator()}

                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                        {currentStep === 5 && renderStep5()}

                        <View style={[styles.navigation]}>
                            {currentStep > 1 && (
                                <Button
                                    onPress={handlePrevious}
                                    variant="outlined"
                                    size="medium"
                                    fullWidth
                                >
                                    Back
                                </Button>
                            )}

                            {currentStep < 5 ? (
                                <Button
                                    onPress={handleNext}
                                    variant="contained"
                                    size="medium"
                                    fullWidth
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onPress={handleRegister}
                                    loading={loading}
                                    disabled={loading || !formData.acceptTerms}
                                    variant="contained"
                                    size="medium"
                                    fullWidth
                                >
                                    Complete Registration
                                </Button>
                            )}
                        </View>

                        <Button
                            onPress={() => router.push('/auth/login')}
                            variant="text"
                            size="medium"
                            fullWidth
                        >
                            Already have an account? Login
                        </Button>
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1
    },
    logo: {
        width: 400,
        height: 150,
        alignSelf: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xl,
        paddingBottom: AppStyles.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: AppStyles.spacing.lg
    },
    gradientTitle: {
        fontFamily: 'Poppins',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Inter',
        fontSize: 16,
        marginTop: AppStyles.spacing.sm,
    },
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
    stepContainer: {
        marginBottom: AppStyles.spacing.lg,
    },
    stepTitle: {
        marginBottom: AppStyles.spacing.md,
        fontWeight: '600',
    },
    sectionLabel: {
        marginBottom: AppStyles.spacing.sm,
        fontWeight: '500',
        marginTop: AppStyles.spacing.md,
    },
    form: {
        gap: AppStyles.spacing.md
    },
    input: {
        marginBottom: AppStyles.spacing.md,
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    segmentedButtons: {
        marginBottom: AppStyles.spacing.md,
    },
    multiLineContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginVertical: 8,
    },
    businessChip: {
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    selectedChip: {
        backgroundColor: AppStyles.colors.light.primary,
    },
    chipText: {
        fontSize: 12,
    },
    selectedChipText: {
        color: AppStyles.colors.light.onPrimary,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.md,
        marginTop: AppStyles.spacing.sm,

    },
    checkboxLabel: {
        marginLeft: 8,
        flex: 1,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: AppStyles.spacing.sm,
    },
    radioText: {
        flex: 1,
        marginLeft: 8,
    },
    helperText: {
        color: '#666',
        marginTop: 2,
    },
    optionalText: {
        color: '#666',
        marginBottom: AppStyles.spacing.md,
        fontStyle: 'italic',
    },
    navigation: {
        marginTop: AppStyles.spacing.lg,
        gap: AppStyles.spacing.lg,
    },
    loginButton: {
        marginTop: AppStyles.spacing.md,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl,
    },
    stepDotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
    },
    stepDotActive: {
        backgroundColor: '#e91e63',
        transform: [{ scale: 1.2 }],
    },
    stepDotCompleted: {
        backgroundColor: '#4caf50',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 4,
    },
    autoFillBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F5E8',
        padding: AppStyles.spacing.md,
        borderRadius: 8,
        marginBottom: AppStyles.spacing.md,
    },
    autoFillText: {
        color: '#2E7D32',
        fontWeight: '600',
        flex: 1,
    },
    refreshLocationButton: {
        marginLeft: AppStyles.spacing.sm,
    },
    manualLocationSection: {
        marginTop: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.md,
        borderTopWidth: 1,
        borderTopColor: AppStyles.colors.light.outline,
    },
    manualLocationHelper: {
        marginTop: AppStyles.spacing.sm,
        textAlign: 'center',
    },
    locationSection: {
        marginTop: AppStyles.spacing.md,
        borderTopWidth: 1,
        borderTopColor: AppStyles.colors.light.outline,
        paddingTop: AppStyles.spacing.md,
    },
    locationLabelContainer: {
        flex: 1,
        marginLeft: 8,
    },
    locationDescription: {
        color: '#666',
        marginTop: 2,
    },
    locationDetails: {
        marginTop: AppStyles.spacing.md,
        paddingLeft: 32, // Align with checkbox
    },
    locationSaved: {
        backgroundColor: '#E8F5E8',
        padding: AppStyles.spacing.md,
        borderRadius: 8,
        marginBottom: AppStyles.spacing.md,
    },
    locationSuccessText: {
        color: '#2E7D32',
        fontWeight: '600',
        marginBottom: 4,
    },
    coordinatesText: {
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: AppStyles.spacing.sm,
    },
    updateLocationButton: {
        alignSelf: 'flex-start',
    },
});