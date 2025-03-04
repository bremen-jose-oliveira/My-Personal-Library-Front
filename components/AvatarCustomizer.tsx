import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Avatar, { genConfig } from 'react-nice-avatar';

import { AvatarColors } from '@/constants/Colors';

const AvatarCustomizer = () => {
    const [config, setConfig] = useState(genConfig());

    const updateAvatar = (property: string, value: any) => {
        setConfig(previousConfig => ({ ...previousConfig, [property]: value }));
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.row}>
                {/* Avatar display on the left */}
                <View style={styles.avatarContainer}>
                    <Avatar style={styles.avatar} {...config} />
                    <Button title="Randomize" onPress={() => setConfig(genConfig())} color="#bf471b" />
                </View>

                {/* Customization pickers on the right */}
                <View style={styles.pickersContainer}>
                    <View style={styles.column}>
                        <CustomPicker label="Hairstyle" property="hairStyle" config={config} updateAvatar={updateAvatar} options={[
                            "normal", "thick", "mohawk", "womanLong", "womanShort"
                        ]}/>
                        <CustomPicker label="Skin Color" property="faceColor" config={config} updateAvatar={updateAvatar} options={[
                         "#AC6651", "#F9C9B6",
                        ]}/>
                            <CustomPicker label="Backgorund shape" property="shape" config={config} updateAvatar={updateAvatar} options={[
                      "circle","rounded", "square"
                        ]}/>
                                   <CustomPicker label="Shirt Color" property="shirtColor" config={config} updateAvatar={updateAvatar} options={[
                      "black", "blue", "brown", "red","yellow", "green", "purple",  "pink", "orange", "white", "gray", "cyan", "magenta", "lime", "teal", "lavender", "brown", "maroon", "olive", "navy", "aquamarine", "turquoise", "silver", "lime", "fuchsia", "purple", "orange"
                    ]}/>
                    </View>
                    <View style={styles.column}>
                        <CustomPicker label="Eye Shape" property="eyeShape" config={config} updateAvatar={updateAvatar} options={[
                            "circle", "oval", "smile"
                        ]}/>
                        <CustomPicker label="Shirt Style" property="shirtStyle" config={config} updateAvatar={updateAvatar} options={[
                            "hoody", "short", "polo"
                        ]}/>
                             <CustomPicker label="Background" property="bgColor" config={config} updateAvatar={updateAvatar} options={[
                       "black", "blue", "brown", "red","yellow", "green", "purple",  "pink", "orange", "white", "gray", "cyan", "magenta", "lime", "teal", "lavender", "brown", "maroon", "olive", "navy", "aquamarine", "turquoise", "silver", "lime", "fuchsia", "purple", "orange"
                        ]}/>
                    
                    </View>
                    <View style={styles.column}>
                        <CustomPicker label="Glasses Style" property="glassesStyle" config={config} updateAvatar={updateAvatar} options={[
                            "none", "round", "square"
                        ]}/>
                        <CustomPicker label="Hat Style" property="hatStyle" config={config} updateAvatar={updateAvatar} options={[
                            "none", "beanie", "turban"
                        ]}/>
                            <CustomPicker label="Eye Brown" property="eyeBrowStyle" config={config} updateAvatar={updateAvatar} options={[
                            "up", "upWoman"
                        ]}/>
                    </View>
                    <View style={styles.column}>
                        <CustomPicker label="Mouth Style" property="mouthStyle" config={config} updateAvatar={updateAvatar} options={[
                             "laugh", "smile", "peace",
                        ]}/>
                        <CustomPicker label="Hair Color" property="hairColor" config={config} updateAvatar={updateAvatar} options={[
                      "black", "blue", "brown", "red","yellow", "green", "purple",  "pink", "orange", "white", "gray", "cyan", "magenta", "lime", "teal", "lavender", "brown", "maroon", "olive", "navy", "aquamarine", "turquoise", "silver", "lime", "fuchsia", "purple", "orange"
                        ]}/>
                                       <CustomPicker label="Hat Color" property="hatColor" config={config} updateAvatar={updateAvatar} options={[
                            "black", "blue", "brown", "red","yellow", "green", "purple",  "pink", "orange", "white", "gray", "cyan", "magenta", "lime", "teal", "lavender", "brown", "maroon", "olive", "navy", "aquamarine", "turquoise", "silver", "lime", "fuchsia", "purple", "orange"
                        ]}/>
                   
                    </View>
                
                    
                </View>
            </View>
        </ScrollView>
    );
};

interface CustomPickerProps {
    label: string;
    property: string;
    config: any;
    updateAvatar: (property: string, value: any) => void;
    options: string[];
}

const CustomPicker = ({ label, property, config, updateAvatar, options }: CustomPickerProps) => (
    <View style={styles.pickerContainer}>
        <Text style={styles.label}>{label}</Text>
        <Picker
            selectedValue={config[property]}
            style={styles.picker}
            onValueChange={(itemValue) => updateAvatar(property, itemValue)}>
            {options.map((option: string) => (
                <Picker.Item key={option} label={option.charAt(0).toUpperCase() + option.slice(1)} value={option} />
            ))}
        </Picker>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    avatarContainer: {
        padding: 10,
        alignItems: 'center',
        marginRight: 20  // Added margin to separate from pickers
    },
    pickersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allows for wrapping into the next row
    },
    column: {
        minWidth: 120, // Minimum width for each column
        maxWidth: '50%', // Maximum width to allow two columns per row
        padding: 10
    },
    pickerContainer: {
        marginBottom: 20
    },
    picker: {
        width: '100%',
        backgroundColor: 'white'
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    avatar: {
        width: 100,
        height: 100,
        marginBottom: 10
    }
});

export default AvatarCustomizer;
