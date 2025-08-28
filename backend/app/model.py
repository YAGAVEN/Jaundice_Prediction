import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------------------
# Model class
# ----------------------
class JaundiceCNN(nn.Module):
    def __init__(self):
        super(JaundiceCNN, self).__init__()
        self.backbone = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.backbone.fc = nn.Identity()
        self.fc = nn.Sequential(
            nn.Linear(512*2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, face, eye):
        f1 = self.backbone(face)
        f2 = self.backbone(eye)
        combined = torch.cat((f1, f2), dim=1)
        return self.fc(combined)

# ----------------------
# Load trained model
# ----------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models/jaundice_cnn.pth")
model = JaundiceCNN().to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

# ----------------------
# Preprocessing
# ----------------------
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ----------------------
# Prediction function
# ----------------------
def predict_jaundice(face_path, eye_path):
    model.eval()
    face = preprocess(Image.open(face_path).convert("RGB")).unsqueeze(0).to(device)
    eye = preprocess(Image.open(eye_path).convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        score = model(face, eye).item()        # 0–1
        severity_percent = score * 100

        if score < 0.33:
            severity_class = "Normal"
        elif score < 0.66:
            severity_class = "Moderate"
        else:
            severity_class = "Severe"

    return {"severity_class": severity_class, "severity_percent": severity_percent}
