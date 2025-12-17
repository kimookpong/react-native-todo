import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { DebugAgent } from '../services/DebugAgent';

export const DebugPanel = () => {
    const [visible, setVisible] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [diagnostics, setDiagnostics] = useState<any>(null);

    if (!__DEV__) return null;

    const refreshLogs = () => {
        setLogs([...DebugAgent.getLogs()]);
    };

    const runDiagnostics = async () => {
        const result = await DebugAgent.runDiagnostics();
        setDiagnostics(result);
        refreshLogs();
    };

    const clearStorage = async () => {
        // Warning: this is destructive
        const { StorageService } = require('../services/storage');
        await StorageService.clearAll();
        DebugAgent.log('Storage cleared via DebugPanel');
        refreshLogs();
    };

    useEffect(() => {
        if (visible) {
            refreshLogs();
        }
    }, [visible]);

    return (
        <>
            <TouchableOpacity
                style={styles.floatingBtn}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.btnText}>🐞</Text>
            </TouchableOpacity>

            <Modal visible={visible} animationType="slide">
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Debug Agent</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text style={styles.closeBtn}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={refreshLogs}>
                            <Text style={styles.actionText}>Refresh Logs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={runDiagnostics}>
                            <Text style={styles.actionText}>Run Diagnostics</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={clearStorage}>
                            <Text style={styles.actionText}>Clear Storage</Text>
                        </TouchableOpacity>
                    </View>

                    {diagnostics && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Diagnostics</Text>
                            <Text style={styles.code}>{JSON.stringify(diagnostics, null, 2)}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Logs</Text>
                        <ScrollView style={styles.logs}>
                            {logs.map((log, index) => (
                                <View key={index} style={styles.logEntry}>
                                    <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                    <Text style={[styles.logMsg, log.level === 'error' && styles.errorText]}>
                                        {log.message}
                                    </Text>
                                    {log.data && (
                                        <Text style={styles.logData}>{JSON.stringify(log.data)}</Text>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingBtn: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: '#333',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 9999,
    },
    btnText: {
        fontSize: 24,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        color: '#007AFF',
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    actionBtn: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    dangerBtn: {
        backgroundColor: '#FF3B30',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    section: {
        padding: 10,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#666',
    },
    code: {
        fontFamily: 'monospace',
        backgroundColor: '#eee',
        padding: 5,
        fontSize: 12,
    },
    logs: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    logEntry: {
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    logTime: {
        fontSize: 10,
        color: '#999',
    },
    logMsg: {
        fontSize: 12,
        color: '#333',
    },
    errorText: {
        color: 'red',
    },
    logData: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
});
