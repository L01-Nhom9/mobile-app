import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ClassList = ({ data, onPressItem, onLeave, ListEmptyComponent, searchText, itemsPerPage = 3 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Reset to page 1 when search changes or data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, data.length]);

    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPressItem(item)}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                    <Text style={styles.className}>{item.name}</Text>
                    <Text style={styles.classDetails}>({item.code})_{item.instructor}</Text>
                    <View style={[styles.progressBar, { backgroundColor: item.color }]} />
                </View>
                {onLeave && (
                    <TouchableOpacity onPress={() => onLeave(item)} style={styles.leaveBtn}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={24} color="#93C5FD" />
            </View>
        </TouchableOpacity>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <View style={styles.pagination}>
                <TouchableOpacity 
                    style={styles.pageArrow} 
                    onPress={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#ccc" : "#000"} />
                </TouchableOpacity>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <TouchableOpacity
                        key={page}
                        onPress={() => onPageChange(page)}
                    >
                         {currentPage === page ? (
                            <LinearGradient
                                colors={['#93C5FD', '#F9A8D4']}
                                style={styles.activePage}
                            >
                                <Text style={styles.activePageText}>{page}</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.pageNumber}>{page}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <TouchableOpacity 
                    style={styles.pageArrow}
                    onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#000"} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={currentItems}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={ListEmptyComponent}
            />

            {renderPagination()}
        </View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flex: 1,
        marginRight: 10,
    },
    leaveBtn: {
        padding: 5,
        marginRight: 5,
    },
    className: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        fontFamily: 'Roboto',
    },
    classDetails: {
        fontSize: 12,
        color: '#555',
        marginBottom: 10,
        fontFamily: 'Roboto',
    },
    progressBar: {
        height: 4,
        width: '80%',
        borderRadius: 2,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    pageArrow: {
        padding: 10,
    },
    pageNumber: {
        fontSize: 16,
        color: '#333',
        marginHorizontal: 15,
        fontFamily: 'Roboto',
    },
    activePage: {
        width: 30,
        height: 30,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    activePageText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
});

export default ClassList;
