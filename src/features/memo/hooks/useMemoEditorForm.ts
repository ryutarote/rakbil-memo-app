import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getMemoDetail, updateMemo } from '@/services/memoService';
import type { MemoDetail, UpdateMemoPayload } from '@/types/api';
import { useSWRConfig } from 'swr';

const memoFormSchema = z.object({
	title: z.string().min(1, { message: 'タイトルは必須です。' }),
	content: z.string(),
});

export type MemoFormInputs = z.infer<typeof memoFormSchema>;

interface UseMemoEditorFormProps {
	selectedMemoId: number | null;
	onMemoUpdated?: (updatedMemo: MemoDetail) => void;
}

export function useMemoEditorForm({
	selectedMemoId,
	onMemoUpdated,
}: UseMemoEditorFormProps) {
	const { accessToken } = useAuth();
	const { mutate } = useSWRConfig();

	const [isLoadingMemo, setIsLoadingMemo] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [currentMemo, setCurrentMemo] = useState<MemoDetail | null>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isValid: isFormValid },
		watch,
		setValue,
	} = useForm<MemoFormInputs>({
		resolver: zodResolver(memoFormSchema),
		defaultValues: { title: '', content: '' },
	});

	useEffect(() => {
		if (selectedMemoId && accessToken) {
			setIsLoadingMemo(true);
			setServerError(null);
			getMemoDetail(accessToken, selectedMemoId).then((result) => {
				if (result.ok) {
					setCurrentMemo(result.value);
					reset({ title: result.value.title, content: result.value.content });
				} else {
					setServerError(result.error.message);
					setCurrentMemo(null);
					reset({ title: '', content: '' });
				}
				setIsLoadingMemo(false);
			});
		} else {
			setCurrentMemo(null);
			reset({ title: '', content: '' });
			setIsLoadingMemo(false);
		}
	}, [selectedMemoId, accessToken, reset]);

	const handleSave = useCallback(
		async (formData: MemoFormInputs) => {
			if (!selectedMemoId || !currentMemo || !accessToken) return;

			setIsSaving(true);
			setServerError(null);

			const payload: UpdateMemoPayload = {
				category_id: currentMemo.category_id,
				title: formData.title,
				content: formData.content,
			};

			const result = await updateMemo(accessToken, selectedMemoId, payload);
			setIsSaving(false);

			if (result.ok) {
				mutate([`/memo/${selectedMemoId}`, accessToken]);
				mutate([
					`/memo/category/${currentMemo.category_id}`,
					accessToken,
					currentMemo.category_id,
				]);
				setCurrentMemo(result.value);
				reset({ title: result.value.title, content: result.value.content });
				if (onMemoUpdated) onMemoUpdated(result.value);
			} else {
				setServerError(result.error.message);
			}
		},
		[selectedMemoId, currentMemo, accessToken, reset, mutate, onMemoUpdated]
	);

	const editorContent = watch('content');

	return {
		control,
		isLoadingMemo,
		isSaving,
		serverError,
		currentMemo,
		formMethods: { handleSubmit, reset, watch, setValue },
		formState: { errors, isDirty, isFormValid },
		handleSave,
		editorContent,
	};
}
