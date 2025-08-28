from model import predict_jaundice

face_path = "temp_uploads/patient001_eye_mild.jpg"
eye_path = "temp_uploads/patient001_face_mild.jpg"

result = predict_jaundice(face_path, eye_path)
print(result)
