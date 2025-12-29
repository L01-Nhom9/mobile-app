import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Filter = ({ options, activeFilter, onSelect }) => {
    return (
        <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Bộ lọc:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {options.map(f => (
                    <TouchableOpacity
                        key={f.id}
                        style={[
                            styles.filterChip,
                            activeFilter === f.id ? { backgroundColor: '#4285F4' } : { backgroundColor: '#E8F0FE' }
                        ]}
                        onPress={() => onSelect(f.id === activeFilter ? 'all' : f.id)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === f.id ? { color: 'white' } : { color: '#4285F4' }
                        ]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        fontFamily: 'Roboto',
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginRight: 10,
    },
    filterText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
});

export default Filter;
