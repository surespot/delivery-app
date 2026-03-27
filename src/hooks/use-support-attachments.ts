import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

const MAX_ATTACHMENTS = 3;

export interface SupportAttachment {
  uri: string;
  type: string;
  name: string;
}

export function useSupportAttachments() {
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);

  const pickImage = useCallback(async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      Alert.alert('Limit Reached', `You can only attach up to ${MAX_ATTACHMENTS} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
    const match = /\.(\w+)$/i.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    setAttachments((prev) => {
      const next = [...prev, { uri, type, name: filename }];
      return next.slice(0, MAX_ATTACHMENTS);
    });
  }, [attachments.length]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const appendToFormData = useCallback(
    (formData: FormData) => {
      attachments.forEach((att) => {
        formData.append('attachments', {
          uri: att.uri,
          type: att.type,
          name: att.name,
        } as any);
      });
    },
    [attachments]
  );

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    pickImage,
    removeAttachment,
    appendToFormData,
    clearAttachments,
    maxAttachments: MAX_ATTACHMENTS,
    canAddMore: attachments.length < MAX_ATTACHMENTS,
  };
}
