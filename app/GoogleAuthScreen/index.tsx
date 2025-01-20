import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthScreen() {
    const router = useRouter();
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        redirectUri: 'https://auth.expo.io/@ose_oliv/my-personal-library-front',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log('Access Token:', authentication?.accessToken);
           
            router.push('/(tabs)'); // Replace with your route
        }
    }, [response]);

    return (
        <View style={styles.container}>
            <Button
                title="Sign in with Google"
                disabled={!request}
                onPress={() => {
                    promptAsync();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
