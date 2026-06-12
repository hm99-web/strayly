import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from '@/components/ui/Input';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: FieldPath<T>;
}

export function FormInput<T extends FieldValues>({ control, name, ...props }: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Input
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
