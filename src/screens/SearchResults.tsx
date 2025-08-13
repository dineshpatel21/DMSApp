import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Button, Platform, PermissionsAndroid } from "react-native";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";
import { zip } from "react-native-zip-archive";
import * as OpenAnything from "react-native-openanything";

const SearchResults = (props: any) => {

    let params = props.route.params
    const [results, setResults] = useState(params?.result)

    const previewFile = (file: any) => {
        OpenAnything.Open(file.file_url);
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                ]);

                return (
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const downloadFile = async (fileData: any) => {
        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission denied', 'Storage permission is required to save the file.');
                return;
            }

            const fileUrl = fileData.file_url;
            const urlWithoutParams = fileUrl.split('?')[0];
            const fileName = urlWithoutParams.split('/').pop() || `file_${Date.now()}.jpg`;

            const localPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

            const { promise } = RNFS.downloadFile({
                fromUrl: fileUrl,
                toFile: localPath,
            });

            await promise;

            Alert.alert('Downloaded', `File saved to Downloads:\n${localPath}`);
            await FileViewer.open(localPath);
        } catch (err) {
            console.error("Download error:", err);
            Alert.alert('Error', 'Could not download file');
        }
    };


    const zipAllFiles = async () => {
        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission denied', 'Storage permission is required to save the ZIP file.');
                return;
            }

            const tempDir = `${RNFS.CachesDirectoryPath}/tempFiles`;

            if (await RNFS.exists(tempDir)) {
                await RNFS.unlink(tempDir);
            }
            await RNFS.mkdir(tempDir);

            await Promise.all(
                results.map(async (file: any) => {
                    const extension = file.file_url.split('.').pop().split('?')[0];
                    const localPath = `${tempDir}/${file.document_id}.${extension}`;
                    await RNFS.downloadFile({
                        fromUrl: file.file_url,
                        toFile: localPath
                    }).promise;
                })
            );

            const zipPath = `${RNFS.DownloadDirectoryPath}/all_documents.zip`;
            await zip(tempDir, zipPath);

            Alert.alert('ZIP Created', `Saved in Downloads:\n${zipPath}`);
            console.log('ZIP file path:', zipPath);
        } catch (error) {
            console.error('Error creating ZIP:', error);
            Alert.alert('Error', 'Could not create ZIP file.');
        }
    };

    return (
        <View style={{ flex: 1, marginTop: 0 }}>
            <Text style={styles.label}>Results</Text>
            <FlatList
                data={results}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.resultItem}>
                        {/* Thumbnail */}
                        <Image
                            source={{ uri: item.file_url }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />

                        {/* File Details */}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headText}>
                                {item.major_head} - {item.minor_head}
                            </Text>
                            <Text style={styles.dateText}>
                                Date: {new Date(item.document_date).toLocaleDateString("en-GB")}
                            </Text>
                            <Text>Remarks: {item.document_remarks}</Text>
                            <Text>Uploaded by: {item.uploaded_by}</Text>
                        </View>

                        {/* Actions */}
                        <View>
                            <TouchableOpacity onPress={() => previewFile(item)}>
                                <Text style={styles.preview}>Preview</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => downloadFile(item)}>
                                <Text style={styles.download}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <Button title="Download All as ZIP" onPress={zipAllFiles} />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    resultItem: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    thumbnail: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 5,
        backgroundColor: "#ddd",
    },
    headText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    dateText: {
        fontSize: 12,
        color: "#666",
    },
    preview: {
        color: "#007BFF",
        marginTop: 5,
    },
    download: {
        color: "green",
        marginTop: 5,
    },
});

export default SearchResults;
