import styled from "styled-components/native";

import { Platform } from "react-native";

import { Form as UnformForm } from "@unform/mobile";

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px;
`;

export const BackButton = styled.TouchableOpacity`
  margin-top: 48px;
  color: #fff;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: #f4ede8;
  font-family: "RobotoSlab-Medium";
  margin: 24px 0;
`;

export const Form = styled(UnformForm)`
  width: 100%;
`;

export const UserAvatarButton = styled.TouchableOpacity``;

export const UserAvatar = styled.Image`
  width: 170px;
  height: 170px;
  border-radius: 85px;
  align-self: center;
`;
