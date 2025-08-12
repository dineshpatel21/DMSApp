import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";
import { zip } from "react-native-zip-archive";

const SearchAndPreview = () => {
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [openFromPicker, setOpenFromPicker] = useState(false);
  const [openToPicker, setOpenToPicker] = useState(false);

  const [results, setResults] = useState<any[]>([]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleSearch = () => {
    // Mock API call
    const mockResults = [
      {
        id: 1,
        name: "Invoice_2024.pdf",
        type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 2,
        name: "Receipt.jpg",
        type: "image",
        url: "https://via.placeholder.com/200"
      },
      {
        id: 3,
        name: "Data.csv",
        type: "other",
        url: "https://example.com/data.csv"
      }
    ];
    setResults(mockResults);
  };

  const previewFile = (file: any) => {
    if (file.type === "image" || file.type === "pdf") {
      Alert.alert("Preview", `Previewing ${file.name}`);
    } else {
      Alert.alert("Unsupported", "Preview not available for this file type.");
    }
  };

  const downloadFile = async (file: any) => {
    try {
      const localPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
      await RNFS.downloadFile({ fromUrl: file.url, toFile: localPath }).promise;
      await FileViewer.open(localPath);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const downloadAllAsZip = async () => {
    try {
      const downloadDir = RNFS.DocumentDirectoryPath + "/downloads";
      await RNFS.mkdir(downloadDir);

      for (const file of results) {
        const localPath = `${downloadDir}/${file.name}`;
        await RNFS.downloadFile({ fromUrl: file.url, toFile: localPath }).promise;
      }

      const zipPath = `${RNFS.DocumentDirectoryPath}/all_files.zip`;
      await zip(downloadDir, zipPath);
      Alert.alert("ZIP Created", `All files saved as ZIP: ${zipPath}`);
    } catch (err) {
      console.error("ZIP error:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search Filters */}
      <Text style={styles.label}>Category</Text>
      <Picker selectedValue={category} onValueChange={setCategory}>
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Company" value="Company" />
        <Picker.Item label="Work Order" value="Work Order" />
        <Picker.Item label="Invoice" value="Invoice" />
      </Picker>

      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagRow}>
        <TextInput
          style={styles.tagInput}
          placeholder="Add tag"
          value={newTag}
          onChangeText={setNewTag}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddTag}>
          <Text style={{ color: "#fff" }}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagList}>
        {tags.map((tag, i) => (
          <View key={i} style={styles.tag}>
            <Text style={{ color: "#fff" }}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* From Date */}
      <Text style={styles.label}>From Date</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenFromPicker(true)}
      >
        <Text style={styles.dateText}>
          {fromDate ? fromDate.toLocaleDateString("en-GB") : "Select Date"}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setOpenFromPicker(false)}
      />

      {/* To Date */}
      <Text style={styles.label}>To Date</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenToPicker(true)}
      >
        <Text style={styles.dateText}>
          {toDate ? toDate.toLocaleDateString("en-GB") : "Select Date"}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openToPicker}
        date={toDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setOpenToPicker(false)}
      />

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={{ color: "#fff" }}>Search</Text>
      </TouchableOpacity>

      {/* Search Results */}
      {results.length > 0 && (
        <>
          <Text style={styles.label}>Results</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Text style={{ flex: 1 }}>{item.name}</Text>
                <TouchableOpacity onPress={() => previewFile(item)}>
                  <Text style={styles.preview}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => downloadFile(item)}>
                  <Text style={styles.download}>Download</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={styles.zipBtn} onPress={downloadAllAsZip}>
            <Text style={{ color: "#fff" }}>Download All as ZIP</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  label: { fontWeight: "bold", marginTop: 10 },
  tagRow: { flexDirection: "row", alignItems: "center" },
  tagInput: { borderBottomWidth: 1, flex: 1, marginRight: 10 },
  addBtn: { backgroundColor: "#007bff", padding: 8, borderRadius: 5 },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5
  },
  tag: {
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginTop: 5
  },
  dateBtn: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginTop: 5
  },
  dateText: {
    fontSize: 16,
    color: "#333"
  },
  searchBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center"
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  preview: { color: "#007bff", marginHorizontal: 10 },
  download: { color: "#28a745" },
  zipBtn: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center"
  }
});

export default SearchAndPreview;
