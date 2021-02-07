import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

import { StyleProp, TextInputProps, ViewStyle } from "react-native";

import { useField } from "@unform/core";

import { Container, TextInput, Icon } from "./styles";

interface IInputProps extends TextInputProps {
  name: string;
  icon: string;
  containerStyle?: StyleProp<ViewStyle>;
}

interface IInputValueReference {
  value: string;
}

interface IInputRef {
  focus(): void;
}

const Input: React.ForwardRefRenderFunction<IInputRef, IInputProps> = (
  { name, icon, containerStyle = {}, ...rest },
  ref
) => {
  const inputElementRef = useRef<any>(null);

  const { registerField, fieldName, defaultValue = "", error } = useField(name);
  const inputValueRef = useRef<IInputValueReference>({ value: defaultValue });

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputValueRef.current.value);
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputElementRef.current.focus();
    },
  }));

  useEffect(() => {
    registerField<string>({
      name: fieldName,
      ref: inputValueRef.current,
      path: "value",
      setValue(refference: any, value) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = "";
        inputElementRef.current.clear();
      },
    });
  }, [registerField, fieldName]);

  return (
    <Container isFocused={isFocused} isErrored={!!error} style={containerStyle}>
      <Icon
        name={icon}
        size={20}
        color={isFocused || isFilled ? "#ff9000" : "#666360"}
      />
      <TextInput
        ref={inputElementRef}
        onChangeText={(value) => {
          inputValueRef.current.value = value;
        }}
        defaultValue={defaultValue}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        {...rest}
      />
    </Container>
  );
};

export default forwardRef(Input);
