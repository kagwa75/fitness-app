import { useEffect, useMemo, useState, useRef } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Workouts from '../data/exercises';
import API_BASE_URL from '../constants/api';

const FOLDERS_STORAGE_KEY_PREFIX = 'custom_workout_folders_v1';
const LEGACY_EXERCISES_KEY = 'custom_workout_exercises_v1';
const normalizeText = (value = '') => String(value).trim().toLowerCase();

const formatCategory = (category = 'general') => {
    const safe = String(category).trim();
    if (!safe) return 'General';
    return safe.charAt(0).toUpperCase() + safe.slice(1);
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const canUseWebStorage = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const readValueByKey = async (key) => {
    try {
        if (canUseWebStorage()) {
            return window.localStorage.getItem(key);
        }

        if (!SecureStore.getItemAsync) return null;
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`Failed to read ${key}:`, error);
        return null;
    }
};

const writeValueByKey = async (key, value) => {
    try {
        if (canUseWebStorage()) {
            window.localStorage.setItem(key, value);
            return;
        }

        if (!SecureStore.setItemAsync) return;
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error(`Failed to write ${key}:`, error);
    }
};

const removeValueByKey = async (key) => {
    try {
        if (canUseWebStorage()) {
            window.localStorage.removeItem(key);
            return;
        }

        if (!SecureStore.deleteItemAsync) return;
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
    }
};

const safeParseArray = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const sanitizeExercise = (exercise, fallbackPrefix = 'exercise') => {
    if (!exercise || !exercise.name) return null;

    const name = String(exercise.name).trim();
    if (!name) return null;

    return {
        id: String(exercise.id || createId(fallbackPrefix)),
        sourceId: String(exercise.sourceId || exercise.id || name),
        name,
        target: String(exercise.target || exercise.categoryLabel || exercise.category || 'General').trim(),
        sets: exercise.sets != null ? String(exercise.sets).trim() : '',
        reps: exercise.reps != null ? String(exercise.reps).trim() : '',
        notes: exercise.notes != null ? String(exercise.notes).trim() : '',
    };
};

const sanitizeFolder = (folder) => {
    if (!folder || !folder.name) return null;
    const name = String(folder.name).trim();
    if (!name) return null;

    const exercises = Array.isArray(folder.exercises)
        ? folder.exercises
              .map((exercise) => sanitizeExercise(exercise, `folder-${folder.id || 'workout'}`))
              .filter(Boolean)
        : [];

    return {
        id: String(folder.id || createId('folder')),
        name,
        exercises,
        createdAt: folder.createdAt || new Date().toISOString(),
        updatedAt: folder.updatedAt,
    };
};

const normalizeApiExercises = (rawExercises) => {
    if (Array.isArray(rawExercises)) return rawExercises;
    if (!rawExercises) return [];

    if (typeof rawExercises === 'string') {
        try {
            const parsed = JSON.parse(rawExercises);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

const mapDatabaseFolder = (folder) =>
    sanitizeFolder({
        id: folder?.id,
        name: folder?.name,
        exercises: normalizeApiExercises(folder?.exercises),
        createdAt: folder?.createdAt,
        updatedAt: folder?.updatedAt,
    });

const buildFolderApiErrorMessage = (error, action) => {
    const status = error?.response?.status;
    const details = error?.response?.data?.error || error?.response?.data?.details || error?.message;

    if (status === 404) {
        return `Folders API route not found on ${API_BASE_URL}. Restart backend with latest routes first.`;
    }

    if (status) {
        return `Could not ${action} folder(s). Server responded with ${status}. ${details || ''}`.trim();
    }

    return `Could not ${action} folder(s). ${details || 'Please try again.'}`.trim();
};

const readFoldersFromDatabase = async (clerkUserId) => {
    const response = await axios.get(`${API_BASE_URL}/users/folders`, {
        params: { clerkUserId },
    });

    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(mapDatabaseFolder).filter(Boolean);
};

const saveFolderToDatabase = async (clerkUserId, folder) => {
    const safeFolder = sanitizeFolder(folder);
    if (!safeFolder) {
        throw new Error('Cannot save an invalid folder.');
    }

    const response = await axios.post(`${API_BASE_URL}/users/folders`, {
        clerkUserId,
        folderId: safeFolder.id,
        name: safeFolder.name,
        exercises: safeFolder.exercises,
    });

    return mapDatabaseFolder(response.data);
};

const updateFolderInDatabase = async (clerkUserId, folder) => {
    const safeFolder = sanitizeFolder(folder);
    if (!safeFolder) {
        throw new Error('Cannot update an invalid folder.');
    }

    const response = await axios.put(`${API_BASE_URL}/users/folders/${encodeURIComponent(safeFolder.id)}`, {
        clerkUserId,
        name: safeFolder.name,
        exercises: safeFolder.exercises,
    });

    return mapDatabaseFolder(response.data);
};

const deleteFolderFromDatabase = async (clerkUserId, folderId) => {
    await axios.delete(`${API_BASE_URL}/users/folders/${encodeURIComponent(folderId)}`, {
        data: { clerkUserId },
    });
};

const getFoldersStorageKey = (clerkUserId) =>
    clerkUserId ? `${FOLDERS_STORAGE_KEY_PREFIX}_${clerkUserId}` : `${FOLDERS_STORAGE_KEY_PREFIX}_guest`;

const writeFolders = async (storageKey, folders) => {
    await writeValueByKey(storageKey, JSON.stringify(folders));
};

const readFoldersWithMigration = async (storageKey, allowLegacyMigration = false) => {
    const rawFolders = await readValueByKey(storageKey);
    const parsedFolders = safeParseArray(rawFolders);

    const sanitizedFolders = parsedFolders.map(sanitizeFolder).filter(Boolean);
    if (sanitizedFolders.length) return sanitizedFolders;

    if (!allowLegacyMigration) return [];

    const rawLegacy = await readValueByKey(LEGACY_EXERCISES_KEY);
    const parsedLegacy = safeParseArray(rawLegacy);
    const legacyExercises = parsedLegacy
        .map((exercise) => sanitizeExercise(exercise, 'legacy'))
        .filter(Boolean);

    if (!legacyExercises.length) return [];

    const migratedFolder = {
        id: createId('folder'),
        name: 'Imported Custom Workout',
        exercises: legacyExercises,
        createdAt: new Date().toISOString(),
    };

    await writeFolders(storageKey, [migratedFolder]);
    await removeValueByKey(LEGACY_EXERCISES_KEY);
    return [migratedFolder];
};

const FolderCard = ({ folder, isExpanded, onToggle, onRename, onEdit, onDelete, onStart }) => (
    <View style={styles.folderCard}>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.85} style={styles.folderHeaderRow}>
            <View style={styles.folderIconWrap}>
                <MaterialCommunityIcons name="folder" size={18} color="#00C2FF" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.folderName}>{folder.name}</Text>
                <Text style={styles.folderMeta}>
                    {folder.exercises.length} exercise{folder.exercises.length === 1 ? '' : 's'}
                </Text>
            </View>

            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#A4A4BB" />
        </TouchableOpacity>

        {isExpanded ? (
            <View style={styles.folderBody}>
                {folder.exercises.length === 0 ? (
                    <Text style={styles.folderEmptyText}>No exercises in this workout yet.</Text>
                ) : (
                    folder.exercises.map((exercise, index) => (
                        <View key={exercise.id} style={styles.folderExerciseRow}>
                            <View style={styles.folderExerciseIndex}>
                                <Text style={styles.folderExerciseIndexText}>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.folderExerciseName}>{exercise.name}</Text>
                                <Text style={styles.folderExerciseMeta}>
                                    {exercise.target || 'General'}
                                    {'  •  '}
                                    {exercise.sets || '-'} sets
                                    {'  •  '}
                                    {exercise.reps || '-'} reps / duration
                                </Text>
                            </View>
                        </View>
                    ))
                )}

                <View style={styles.folderActionsRow}>
                    <TouchableOpacity
                        onPress={() => onStart(folder)}
                        activeOpacity={0.9}
                        style={styles.folderStartBtn}
                        disabled={folder.exercises.length === 0}
                    >
                        <LinearGradient
                            colors={folder.exercises.length ? ['#FF4D2E', '#FF2800'] : ['#3A3A4F', '#2B2B3C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.folderStartBtnGradient}
                        >
                            <MaterialCommunityIcons name="whistle" size={14} color="#fff" />
                            <Text style={styles.folderStartBtnText}>Start Workout</Text>
                            <Feather name="arrow-right" size={13} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onRename(folder)} activeOpacity={0.85} style={styles.folderActionBtn}>
                        <Feather name="edit-3" size={13} color="#00C2FF" />
                        <Text style={styles.folderActionText}>Rename</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onEdit(folder)} activeOpacity={0.85} style={styles.folderActionBtn}>
                        <MaterialCommunityIcons name="playlist-edit" size={14} color="#00E5BE" />
                        <Text style={styles.folderActionText}>Edit Exercises</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onDelete(folder.id)} activeOpacity={0.85} style={styles.deleteFolderBtn}>
                        <Feather name="trash-2" size={13} color="#FF4D2E" />
                        <Text style={styles.deleteFolderBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : null}
    </View>
);

const LibraryExerciseRow = ({ exercise, isSelected, onToggle }) => (
    <View style={styles.libraryRow}>
        <View style={{ flex: 1 }}>
            <Text style={styles.libraryName}>{exercise.name}</Text>
            <Text style={styles.libraryMeta}>
                {exercise.categoryLabel}
                {'  •  '}
                {exercise.defaultSets || '-'} sets
                {exercise.defaultReps ? `  •  ${exercise.defaultReps}` : ''}
            </Text>
        </View>

        <TouchableOpacity
            onPress={() => onToggle(exercise)}
            activeOpacity={0.85}
            style={[styles.librarySelectBtn, isSelected && styles.librarySelectBtnActive]}
        >
            <MaterialCommunityIcons
                name={isSelected ? 'check' : 'plus'}
                size={14}
                color={isSelected ? '#041018' : '#00E5BE'}
            />
            <Text style={[styles.librarySelectBtnText, isSelected && styles.librarySelectBtnTextActive]}>
                {isSelected ? 'Selected' : 'Select'}
            </Text>
        </TouchableOpacity>
    </View>
);

const SelectedExerciseEditorRow = ({ exercise, index, onRemove, onChange }) => (
    <View style={styles.selectedEditorCard}>
        <View style={styles.selectedEditorHeader}>
            <View style={styles.selectedEditorIndexWrap}>
                <Text style={styles.selectedEditorIndexText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.selectedEditorName}>{exercise.name}</Text>
                <Text style={styles.selectedEditorMeta}>{exercise.target || 'General'}</Text>
            </View>
            <TouchableOpacity onPress={() => onRemove(exercise.id)} style={styles.selectedEditorDeleteBtn}>
                <Feather name="x" size={12} color="#FF4D2E" />
            </TouchableOpacity>
        </View>

        <View style={styles.selectedEditorFieldsRow}>
            <View style={styles.selectedEditorField}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                    value={exercise.sets}
                    onChangeText={(value) => onChange(exercise.id, 'sets', value)}
                    placeholder="3"
                    placeholderTextColor="#5F5F76"
                    keyboardType="number-pad"
                    style={styles.input}
                />
            </View>
            <View style={styles.selectedEditorField}>
                <Text style={styles.inputLabel}>Reps / Duration</Text>
                <TextInput
                    value={exercise.reps}
                    onChangeText={(value) => onChange(exercise.id, 'reps', value)}
                    placeholder="12 or 30s"
                    placeholderTextColor="#5F5F76"
                    style={styles.input}
                />
            </View>
        </View>

        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
            value={exercise.notes}
            onChangeText={(value) => onChange(exercise.id, 'notes', value)}
            placeholder="Optional note"
            placeholderTextColor="#5F5F76"
            multiline
            style={[styles.input, styles.notesInput]}
        />
    </View>
);

export default function Custom() {
    const { user } = useUser();
    const clerkUserId = user?.id || null;
    const navigation = useNavigation();
    const foldersStorageKey = useMemo(() => getFoldersStorageKey(clerkUserId), [clerkUserId]);

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFolderId, setExpandedFolderId] = useState(null);

    const [isModalVisible, setModalVisible] = useState(false);
    const [builderMode, setBuilderMode] = useState('create');
    const [activeFolderId, setActiveFolderId] = useState(null);

    const [folderName, setFolderName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            const storedFolders = await readFoldersWithMigration(foldersStorageKey, !clerkUserId);

            if (!clerkUserId) {
                if (!isMounted) return;
                setFolders(storedFolders);
                setLoading(false);
                return;
            }

            try {
                const remoteFolders = await readFoldersFromDatabase(clerkUserId);
                let resolvedFolders = remoteFolders;

                const remoteFolderIdSet = new Set(remoteFolders.map((folder) => folder.id));
                const foldersToMigrate = storedFolders.filter((folder) => !remoteFolderIdSet.has(folder.id));

                // One-time migration path for any local-only folders.
                if (foldersToMigrate.length) {
                    const migratedFolders = [];
                    for (const localFolder of foldersToMigrate) {
                        const saved = await saveFolderToDatabase(clerkUserId, localFolder);
                        if (saved) migratedFolders.push(saved);
                    }
                    resolvedFolders = [...migratedFolders, ...remoteFolders];
                }

                if (!isMounted) return;
                setFolders(resolvedFolders);
                await writeFolders(foldersStorageKey, resolvedFolders);
            } catch (error) {
                console.error('Failed to load folders from database:', error);
                if (!isMounted) return;
                setFolders(storedFolders);
                Alert.alert(
                    'Cloud sync unavailable',
                    buildFolderApiErrorMessage(error, 'load')
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [clerkUserId, foldersStorageKey]);

    const libraryExercises = useMemo(() => {
        return Workouts.map((item) => ({
            sourceId: String(item.id ?? item.name),
            name: String(item.name || '').trim(),
            categoryLabel: formatCategory(item.category),
            defaultSets: item.sets != null ? String(item.sets) : '',
            defaultReps: item.duration != null ? String(item.duration) : '',
        }))
            .filter((item) => item.name)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const filteredLibrary = useMemo(() => {
        const query = normalizeText(searchQuery);
        if (!query) return libraryExercises;

        return libraryExercises.filter(
            (exercise) =>
                normalizeText(exercise.name).includes(query) ||
                normalizeText(exercise.categoryLabel).includes(query)
        );
    }, [libraryExercises, searchQuery]);

    const activeFolder = useMemo(
        () => folders.find((folder) => folder.id === activeFolderId) || null,
        [folders, activeFolderId]
    );

    const folderCount = folders.length;
    const exerciseCount = useMemo(
        () => folders.reduce((total, folder) => total + folder.exercises.length, 0),
        [folders]
    );

    const selectedSourceSet = useMemo(
        () => new Set(selectedExercises.map((exercise) => String(exercise.sourceId || exercise.name))),
        [selectedExercises]
    );

    const resetBuilderState = () => {
        setBuilderMode('create');
        setActiveFolderId(null);
        setFolderName('');
        setSearchQuery('');
        setSelectedExercises([]);
    };

    const btnScale = useRef(new Animated.Value(1)).current;
    const handlePressIn = () =>
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, tension: 300 }).start();
    const handlePressOut = () =>
        Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

    const mapExercisesForWorkout = (customExercises = []) =>
        customExercises.map((exercise) => {
            const repsRaw = String(exercise.reps || '').trim();
            const setsRaw = String(exercise.sets || '').trim();
            const isTime = /s$|sec|secs|second|seconds/i.test(repsRaw) || /s$/.test(repsRaw);
            let duration = null;
            let sets = null;

            if (isTime) {
                const num = parseInt(repsRaw.replace(/[^0-9]/g, ''), 10);
                duration = Number.isFinite(num) && num > 0 ? num : 30;
            } else {
                const numSets = parseInt(setsRaw.replace(/[^0-9]/g, ''), 10);
                sets = Number.isFinite(numSets) && numSets > 0 ? numSets : 3;
            }

            return {
                name: exercise.name,
                target: exercise.target || null,
                type: duration ? 'time' : 'reps',
                duration: duration || undefined,
                sets: sets || undefined,
            };
        });

    const startWorkoutFromFolder = (folder) => {
        if (!folder || !Array.isArray(folder.exercises) || folder.exercises.length === 0) {
            Alert.alert('No exercises', 'Please create or select a custom workout folder first.');
            return;
        }

        const mapped = mapExercisesForWorkout(folder.exercises);
        if (!mapped.length) {
            Alert.alert('No exercises', 'This folder does not contain valid exercises yet.');
            return;
        }

        navigation.navigate('Fit', {
            exercises: mapped,
            dayName: folder.name,
            totalDays: mapped.length,
            dayIndex: 0,
            programKey: `custom-${folder.id}`,
        });
    };

    const onStartPress = () => {
        const startFolder = folders.find((f) => f.id === expandedFolderId) || folders[0] || null;
        if (!startFolder) {
            Alert.alert('No exercises', 'Please create or select a custom workout folder first.');
            return;
        }

        startWorkoutFromFolder(startFolder);
    };

    const closeBuilderModal = () => {
        setModalVisible(false);
        resetBuilderState();
    };

    const openCreateModal = () => {
        resetBuilderState();
        setBuilderMode('create');
        setModalVisible(true);
    };

    const openRenameModal = (folder) => {
        setBuilderMode('rename');
        setActiveFolderId(folder.id);
        setFolderName(folder.name);
        setSearchQuery('');
        setSelectedExercises([]);
        setModalVisible(true);
    };

    const openEditModal = (folder) => {
        const initialExercises = (folder.exercises || [])
            .map((exercise) => sanitizeExercise(exercise, `folder-${folder.id}`))
            .filter(Boolean);

        setBuilderMode('edit');
        setActiveFolderId(folder.id);
        setFolderName(folder.name);
        setSearchQuery('');
        setSelectedExercises(initialExercises);
        setModalVisible(true);
    };

    const toggleSelectExercise = (libraryExercise) => {
        const sourceId = String(libraryExercise.sourceId);
        const isSelected = selectedSourceSet.has(sourceId);

        if (isSelected) {
            setSelectedExercises((prev) => prev.filter((exercise) => String(exercise.sourceId) !== sourceId));
            return;
        }

        const nextExercise = {
            id: createId('exercise'),
            sourceId,
            name: libraryExercise.name,
            target: libraryExercise.categoryLabel,
            sets: libraryExercise.defaultSets,
            reps: libraryExercise.defaultReps,
            notes: '',
        };

        setSelectedExercises((prev) => [nextExercise, ...prev]);
    };

    const removeSelectedExercise = (exerciseId) => {
        setSelectedExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
    };

    const updateSelectedExerciseField = (exerciseId, key, value) => {
        setSelectedExercises((prev) =>
            prev.map((exercise) =>
                exercise.id === exerciseId
                    ? {
                          ...exercise,
                          [key]: value,
                      }
                    : exercise
            )
        );
    };

    const saveBuilderChanges = async () => {
        const trimmedName = folderName.trim();
        if (!trimmedName) {
            Alert.alert('Missing workout name', 'Please enter a folder/workout name before saving.');
            return;
        }

        if (builderMode === 'create' && !selectedExercises.length) {
            Alert.alert('No exercises selected', 'Select at least one exercise before saving the workout.');
            return;
        }

        if (builderMode === 'create') {
            const newFolderDraft = {
                id: createId('folder'),
                name: trimmedName,
                exercises: selectedExercises
                    .map((exercise) => sanitizeExercise(exercise, 'exercise'))
                    .filter(Boolean)
                    .map((exercise) => ({ ...exercise, id: createId('exercise') })),
                createdAt: new Date().toISOString(),
            };

            let newFolder = newFolderDraft;
            if (clerkUserId) {
                try {
                    newFolder = await saveFolderToDatabase(clerkUserId, newFolderDraft);
                } catch (error) {
                    console.error('Failed to save folder to database:', error);
                    Alert.alert('Save failed', buildFolderApiErrorMessage(error, 'save'));
                    return;
                }
            }

            const nextFolders = [newFolder, ...folders];
            setFolders(nextFolders);
            setExpandedFolderId(newFolder.id);
            await writeFolders(foldersStorageKey, nextFolders);
            closeBuilderModal();
            return;
        }

        if (!activeFolderId) return;

        const currentFolder = folders.find((folder) => folder.id === activeFolderId);
        if (!currentFolder) return;

        let updatedFolderDraft = currentFolder;
        if (builderMode === 'rename') {
            updatedFolderDraft = {
                ...currentFolder,
                name: trimmedName,
                updatedAt: new Date().toISOString(),
            };
        }

        if (builderMode === 'edit') {
            updatedFolderDraft = {
                ...currentFolder,
                exercises: selectedExercises
                    .map((exercise) => sanitizeExercise(exercise, `folder-${currentFolder.id}`))
                    .filter(Boolean),
                updatedAt: new Date().toISOString(),
            };
        }

        let updatedFolder = updatedFolderDraft;
        if (clerkUserId) {
            try {
                updatedFolder = await updateFolderInDatabase(clerkUserId, updatedFolderDraft);
            } catch (error) {
                console.error('Failed to update folder in database:', error);
                Alert.alert('Save failed', buildFolderApiErrorMessage(error, 'update'));
                return;
            }
        }

        const nextFolders = folders.map((folder) =>
            folder.id === activeFolderId ? updatedFolder : folder
        );

        setFolders(nextFolders);
        await writeFolders(foldersStorageKey, nextFolders);

        if (builderMode === 'edit') {
            setExpandedFolderId(activeFolderId);
        }

        closeBuilderModal();
    };

    const deleteFolder = (folderId) => {
        Alert.alert('Delete custom workout', 'Remove this workout folder and all selected exercises?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (clerkUserId) {
                        try {
                            await deleteFolderFromDatabase(clerkUserId, folderId);
                        } catch (error) {
                            console.error('Failed to delete folder from database:', error);
                            Alert.alert('Delete failed', buildFolderApiErrorMessage(error, 'delete'));
                            return;
                        }
                    }

                    const nextFolders = folders.filter((folder) => folder.id !== folderId);
                    setFolders(nextFolders);
                    if (expandedFolderId === folderId) {
                        setExpandedFolderId(null);
                    }
                    await writeFolders(foldersStorageKey, nextFolders);
                },
            },
        ]);
    };

    const modalTitle =
        builderMode === 'create'
            ? 'Create Custom Workout'
            : builderMode === 'rename'
              ? 'Rename Workout Folder'
              : 'Edit Workout Exercises';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={['#0D0D0F', '#131318']} style={styles.headerBg} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <View>
                            <View style={styles.pageBadge}>
                                <MaterialCommunityIcons name="folder-multiple" size={12} color="#00C2FF" />
                                <Text style={styles.pageBadgeText}>CUSTOM</Text>
                            </View>
                            <Text style={styles.title}>Workout Folders</Text>
                            <Text style={styles.subtitle}>
                                Save selected exercises into named folders and reuse them anytime.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{folderCount}</Text>
                            <Text style={styles.statLabel}>Folders</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{exerciseCount}</Text>
                            <Text style={styles.statLabel}>Exercises</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{libraryExercises.length}</Text>
                            <Text style={styles.statLabel}>Library</Text>
                        </View>
                    </View>

                    <View style={styles.sectionTitleRow}>
                        <MaterialCommunityIcons name="folder-open-outline" size={16} color="#00E5BE" />
                        <Text style={styles.sectionTitle}>My Custom Workouts</Text>
                    </View>

                    {loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Loading your custom workouts...</Text>
                        </View>
                    ) : folders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <MaterialCommunityIcons name="folder-plus-outline" size={28} color="#00C2FF" />
                            </View>
                            <Text style={styles.emptyTitle}>No custom workouts yet</Text>
                            <Text style={styles.emptySubtext}>
                                Create your first workout folder below.
                            </Text>
                        </View>
                    ) : (
                        folders.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                folder={folder}
                                isExpanded={expandedFolderId === folder.id}
                                onToggle={() =>
                                    setExpandedFolderId((prev) => (prev === folder.id ? null : folder.id))
                                }
                                onRename={openRenameModal}
                                onEdit={openEditModal}
                                onDelete={deleteFolder}
                                onStart={startWorkoutFromFolder}
                            />
                        ))
                    )}

                    <TouchableOpacity onPress={openCreateModal} activeOpacity={0.88} style={styles.createButton}>
                        <LinearGradient colors={['#00C2FF', '#00E5BE']} style={styles.createButtonGradient}>
                            <MaterialCommunityIcons name="folder-plus-outline" size={17} color="#041018" />
                            <Text style={styles.createButtonText}>Add Exercises / Create Custom Workout</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Sticky START button 
            <View style={styles.stickyBottom}>
                <TouchableOpacity
                    onPress={onStartPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <Animated.View style={[styles.startBtn, { transform: [{ scale: btnScale }] }]}>
                        <LinearGradient
                            colors={['#FF4D2E', '#FF2800']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startBtnGradient}
                        >
                            <MaterialCommunityIcons name="whistle" size={22} color="#fff" />
                            <Text style={styles.startBtnText}>START WORKOUT</Text>
                            <Feather name="arrow-right" size={18} color="#fff" />
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </View>*/}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeBuilderModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity onPress={closeBuilderModal} style={styles.modalCloseBtn}>
                                <Feather name="x" size={16} color="#D2D2E8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                            <Text style={styles.inputLabel}>Folder name *</Text>
                            <TextInput
                                value={folderName}
                                onChangeText={setFolderName}
                                placeholder="e.g. Monday Strength"
                                placeholderTextColor="#5F5F76"
                                style={styles.input}
                            />

                            {builderMode === 'rename' ? null : (
                                <>
                                    {builderMode === 'edit' && activeFolder ? (
                                        <View style={styles.editingFolderChip}>
                                            <MaterialCommunityIcons name="pencil-circle-outline" size={14} color="#FFB800" />
                                            <Text style={styles.editingFolderChipText}>Editing: {activeFolder.name}</Text>
                                        </View>
                                    ) : null}

                                    <Text style={[styles.inputLabel, { marginTop: 10 }]}>Search exercises</Text>
                                    <View style={styles.searchBar}>
                                        <Feather name="search" size={15} color="#7E7E98" />
                                        <TextInput
                                            style={styles.searchInput}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            placeholder="Search by exercise or body part"
                                            placeholderTextColor="#5F5F76"
                                            returnKeyType="search"
                                        />
                                        {searchQuery ? (
                                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                                <View style={styles.searchClearBtn}>
                                                    <Feather name="x" size={11} color="#A0A0B4" />
                                                </View>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    <Text style={styles.resultsCountText}>
                                        {filteredLibrary.length} result{filteredLibrary.length === 1 ? '' : 's'}
                                    </Text>

                                    {filteredLibrary.length === 0 ? (
                                        <View style={styles.inlineEmptyState}>
                                            <Text style={styles.inlineEmptyText}>No exercises match your search.</Text>
                                        </View>
                                    ) : (
                                        filteredLibrary.map((exercise) => (
                                            <LibraryExerciseRow
                                                key={exercise.sourceId}
                                                exercise={exercise}
                                                isSelected={selectedSourceSet.has(exercise.sourceId)}
                                                onToggle={toggleSelectExercise}
                                            />
                                        ))
                                    )}

                                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>Selected exercises</Text>
                                    {selectedExercises.length === 0 ? (
                                        <View style={styles.inlineEmptyState}>
                                            <Text style={styles.inlineEmptyText}>Select exercises to build this folder.</Text>
                                        </View>
                                    ) : (
                                        selectedExercises.map((exercise, index) => (
                                            <SelectedExerciseEditorRow
                                                key={exercise.id}
                                                exercise={exercise}
                                                index={index}
                                                onRemove={removeSelectedExercise}
                                                onChange={updateSelectedExerciseField}
                                            />
                                        ))
                                    )}
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity onPress={saveBuilderChanges} activeOpacity={0.88} style={styles.saveFolderBtn}>
                            <LinearGradient colors={['#00C2FF', '#00E5BE']} style={styles.saveFolderBtnGradient}>
                                <MaterialCommunityIcons
                                    name={builderMode === 'rename' ? 'content-save-edit' : 'content-save-plus'}
                                    size={17}
                                    color="#041018"
                                />
                                <Text style={styles.saveFolderText}>
                                    {builderMode === 'rename'
                                        ? 'Save Folder Name'
                                        : builderMode === 'edit'
                                          ? 'Save Exercise Changes'
                                          : 'Save Workout Folder'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0F',
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 220,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 120,
        gap: 14,
    },
    header: {
        paddingTop: 6,
        marginBottom: 2,
    },
    pageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 6,
    },
    pageBadgeText: {
        color: '#00C2FF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 31,
        fontWeight: '900',
        letterSpacing: -0.6,
    },
    subtitle: {
        color: '#8A8AA5',
        fontSize: 13,
        marginTop: 6,
        lineHeight: 18,
        maxWidth: '95%',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 64,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    statLabel: {
        color: '#7A7A93',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 8,
    },
    sectionTitle: {
        color: '#EAEAFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    emptyState: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#111118',
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyIconBg: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(0,194,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emptyTitle: {
        color: '#EAEAFF',
        fontWeight: '800',
        fontSize: 15,
    },
    emptySubtext: {
        color: '#7E7E98',
        marginTop: 6,
        fontSize: 13,
        textAlign: 'center',
    },
    folderCard: {
        backgroundColor: '#111118',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    folderHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    folderIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,194,255,0.16)',
    },
    folderName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    folderMeta: {
        color: '#8C8CA7',
        fontSize: 11,
        marginTop: 2,
    },
    folderBody: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    folderExerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 2,
    },
    folderExerciseIndex: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: 'rgba(0,229,190,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    folderExerciseIndexText: {
        color: '#00E5BE',
        fontSize: 11,
        fontWeight: '800',
    },
    folderExerciseName: {
        color: '#F1F1FF',
        fontSize: 13,
        fontWeight: '700',
    },
    folderExerciseMeta: {
        color: '#7F7F99',
        fontSize: 11,
        marginTop: 2,
    },
    folderEmptyText: {
        color: '#9292A9',
        fontSize: 12,
        fontStyle: 'italic',
    },
    folderActionsRow: {
        marginTop: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    folderStartBtn: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    folderStartBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 11,
        paddingVertical: 8,
    },
    folderStartBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.2,
    },
    folderActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,194,255,0.28)',
        backgroundColor: 'rgba(0,194,255,0.12)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    folderActionText: {
        color: '#C6EEFF',
        fontSize: 12,
        fontWeight: '700',
    },
    deleteFolderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.34)',
        backgroundColor: 'rgba(255,77,46,0.12)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    deleteFolderBtnText: {
        color: '#FF4D2E',
        fontSize: 12,
        fontWeight: '800',
    },
    createButton: {
        marginTop: 4,
        borderRadius: 14,
        overflow: 'hidden',
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 13,
        paddingHorizontal: 14,
    },
    createButtonText: {
        color: '#041018',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        maxHeight: '92%',
        backgroundColor: '#0F0F16',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    modalCloseBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    modalBody: {
        paddingBottom: 8,
    },
    editingFolderChip: {
        marginTop: 10,
        marginBottom: 2,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.36)',
        backgroundColor: 'rgba(255,184,0,0.12)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    editingFolderChipText: {
        color: '#FFD98A',
        fontSize: 12,
        fontWeight: '700',
    },
    inputLabel: {
        color: '#A5A5BE',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#171723',
        borderWidth: 1,
        borderColor: '#232334',
        borderRadius: 12,
        color: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    searchBar: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#171723',
        borderWidth: 1,
        borderColor: '#232334',
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 44,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        paddingVertical: 10,
    },
    searchClearBtn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    resultsCountText: {
        marginTop: 8,
        color: '#8E8EAA',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    libraryRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        backgroundColor: '#171723',
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    libraryName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    libraryMeta: {
        color: '#8E8EAA',
        fontSize: 11,
        marginTop: 3,
    },
    librarySelectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,229,190,0.45)',
        backgroundColor: 'rgba(0,229,190,0.12)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        minWidth: 74,
        justifyContent: 'center',
    },
    librarySelectBtnActive: {
        borderColor: '#00E5BE',
        backgroundColor: '#00E5BE',
    },
    librarySelectBtnText: {
        color: '#00E5BE',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    librarySelectBtnTextActive: {
        color: '#041018',
    },
    inlineEmptyState: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        backgroundColor: '#171723',
        paddingVertical: 14,
        alignItems: 'center',
    },
    inlineEmptyText: {
        color: '#A1A1BA',
        fontSize: 13,
    },
    selectedEditorCard: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        backgroundColor: '#171723',
        padding: 10,
        gap: 8,
    },
    selectedEditorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectedEditorIndexWrap: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: 'rgba(0,194,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedEditorIndexText: {
        color: '#00C2FF',
        fontSize: 11,
        fontWeight: '800',
    },
    selectedEditorName: {
        color: '#EDEDFE',
        fontSize: 13,
        fontWeight: '800',
    },
    selectedEditorMeta: {
        color: '#8E8EAA',
        fontSize: 11,
        marginTop: 2,
    },
    selectedEditorDeleteBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,77,46,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,77,46,0.25)',
    },
    selectedEditorFieldsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    selectedEditorField: {
        flex: 1,
    },
    notesInput: {
        minHeight: 64,
        textAlignVertical: 'top',
    },
    saveFolderBtn: {
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveFolderBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 12,
    },
    saveFolderText: {
        color: '#041018',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 0.4,
    },
    stickyBottom: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 12,
        zIndex: 30,
        alignItems: 'center',
    },
    startBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    startBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    startBtnText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 0.4,
    },
});
