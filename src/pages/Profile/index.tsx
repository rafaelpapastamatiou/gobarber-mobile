import React, { useRef, useCallback, useMemo, useState } from "react";

import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FormHandles } from "@unform/core";

import * as Yup from "yup";

import Icon from "react-native-vector-icons/Feather";

import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import ModalSelector from "react-native-modal-selector";

import { useAuth } from "../../hooks/auth";

import getValidationErrors from "../../utils/getValidationErrors";

import api from "../../services/api";

import Input from "../../components/Input";

import Button from "../../components/Button";

import {
  Container,
  BackButton,
  Title,
  Form,
  UserAvatarButton,
  UserAvatar,
} from "./styles";

interface ProfileFormData {
  name: string;
  email: string;
  old_password?: string;
  password?: string;
  password_confirmation?: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const navigation = useNavigation();

  const [showSelector, setShowSelector] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const emailInputRef = useRef<TextInput>(null);

  const oldPasswordInputRef = useRef<TextInput>(null);

  const passwordInputRef = useRef<TextInput>(null);

  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required("Nome obrigatório"),
          email: Yup.string()
            .required("E-mail obrigatório")
            .email("Digite um e-mail válido"),
          old_password: Yup.string(),
          password: Yup.string().when("old_password", {
            is: (val: any) => !!val.length,
            then: Yup.string().required().min(6, "No mínimo 6 dígitos."),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when("old_password", {
              is: (val: any) => !!val.length,
              then: Yup.string().required().min(6, "No mínimo 6 dígitos."),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref("password"), undefined], "Confirmação incorreta"),
        });

        await schema.validate(data, { abortEarly: false });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? { old_password, password, password_confirmation }
            : {}),
        };

        const response = await api.put("profile", formData);

        updateUser(response.data);

        Alert.alert("Perfil atualizado com sucesso!");

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          "Erro na atualização do perfil",
          "Ocorreu um erro ao atualizar seu perfil, tente novamente."
        );
      }
    },
    [navigation, updateUser]
  );

  const handleLaunchCamera = useCallback(() => {
    launchCamera(
      { mediaType: "photo", maxWidth: 256, maxHeight: 256, quality: 1 },
      async (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert("Erro ao atualizar seu avatar.");
          return;
        }

        if (response.uri && response.type && response.fileName) {
          const data = new FormData();

          data.append("avatar", {
            uri: response.uri,
            type: response.type || "image/jpeg",
            name: response.fileName,
          });

          const apiResponse = await api.patch("users/avatar", data);

          updateUser(apiResponse.data);
        }
      }
    );
  }, [updateUser]);

  const handleLaunchImageLibrary = useCallback(() => {
    launchImageLibrary(
      { mediaType: "photo", maxWidth: 256, maxHeight: 256, quality: 1 },
      async (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert("Erro ao atualizar seu avatar.");
          return;
        }

        if (response.uri && response.type && response.fileName) {
          const data = new FormData();

          data.append("avatar", {
            uri: response.uri,
            type: response.type,
            name: response.fileName,
          });

          const apiResponse = await api.patch("users/avatar", data);

          updateUser(apiResponse.data);
        }
      }
    );
  }, [updateUser]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenSelector = useCallback(() => {
    setShowSelector(true);
  }, []);

  const modalSelectorOptions = useMemo(
    () => [
      { key: 0, label: "Galeria", onClick: () => handleLaunchImageLibrary() },
      { key: 1, label: "Câmera", onClick: () => handleLaunchCamera() },
    ],
    [handleLaunchCamera, handleLaunchImageLibrary]
  );

  return (
    <>
      <KeyboardAvoidingView
        enabled
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleOpenSelector}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form
              ref={formRef}
              onSubmit={handleSignUp}
              initialData={{ name: user.name, email: user.email }}
            >
              <Input
                autoCorrect
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
                containerStyle={{
                  marginTop: 16,
                }}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="password"
                icon="lock"
                placeholder="Nova senha"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordConfirmationInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordConfirmationInputRef}
                secureTextEntry
                textContentType="newPassword"
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Confirmar mudanças
              </Button>

              <ModalSelector
                visible={showSelector}
                closeOnChange
                optionTextStyle={{
                  fontFamily: "RobotoSlab-Regular",
                  color: "#f4ede8",
                }}
                optionContainerStyle={{
                  backgroundColor: "#28262e",
                }}
                cancelTextStyle={{
                  fontFamily: "RobotoSlab-Medium",
                }}
                cancelStyle={{
                  backgroundColor: "#ff9000",
                }}
                selectStyle={{ flex: 1 }}
                childrenContainerStyle={{ display: "none", opacity: 0 }}
                cancelText="Cancelar"
                data={modalSelectorOptions}
                supportedOrientations={["landscape"]}
                onChange={(option) => {
                  setShowSelector(false);
                  option.onClick();
                }}
                onModalClose={() => setShowSelector(false)}
                backdropPressToClose
                animationType="slide"
              />
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
