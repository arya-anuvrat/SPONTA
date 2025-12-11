# VM Training Plan - Future Enhancement

## 🎯 Goal

Train our own AI model to replace Gemini for challenge generation, using a school VM with high specifications.

---

## 📋 Prerequisites

### VM Requirements:
- **GPU:** NVIDIA GPU with 16GB+ VRAM (for training)
- **RAM:** 32GB+ recommended
- **Storage:** 100GB+ for model and data
- **OS:** Linux (Ubuntu 20.04+ recommended)

### Software Needed:
- Python 3.8+
- CUDA/cuDNN (for GPU)
- PyTorch or TensorFlow
- Hugging Face Transformers
- Jupyter Notebook (optional)

---

## 🗂️ Step-by-Step Plan

### Phase 1: Data Collection (1-2 weeks)

1. **Collect Challenge Data:**
   ```javascript
   // Add to challengeGenerationService.js
   async function saveTrainingData(challenge) {
     // Save generated challenges to a training dataset
     // Include: title, description, category, difficulty, user context
   }
   ```

2. **Build Dataset:**
   - Collect 500-1000 generated challenges
   - Include user feedback (which challenges are popular)
   - Label data quality (good/bad challenges)

3. **Format for Training:**
   - Convert to JSONL format
   - Structure: `{"prompt": "...", "completion": "..."}`

---

### Phase 2: Model Selection (1 week)

**Recommended Models:**
1. **LLaMA 7B** - Good balance, open source
2. **Mistral 7B** - Fast, efficient
3. **Phi-2** - Small, fast, good for fine-tuning

**Why These:**
- Small enough to train on single GPU
- Open source (no licensing issues)
- Good performance for text generation

---

### Phase 3: Fine-Tuning Setup (1 week)

1. **Install Dependencies:**
   ```bash
   pip install transformers datasets accelerate peft
   pip install torch torchvision torchaudio
   ```

2. **Prepare Training Script:**
   ```python
   # train_challenge_model.py
   from transformers import AutoModelForCausalLM, TrainingArguments, Trainer
   from datasets import load_dataset
   
   # Load base model
   model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1")
   
   # Load our challenge dataset
   dataset = load_dataset("json", data_files="challenges.jsonl")
   
   # Fine-tune on our data
   # ... training code ...
   ```

3. **Training Configuration:**
   - Epochs: 3-5
   - Learning rate: 2e-5
   - Batch size: 4-8 (depending on GPU)
   - Use LoRA for efficient training

---

### Phase 4: Training (2-3 days)

1. **Run Training:**
   ```bash
   python train_challenge_model.py
   ```

2. **Monitor:**
   - Loss should decrease
   - Check GPU utilization
   - Save checkpoints regularly

3. **Evaluate:**
   - Test on validation set
   - Generate sample challenges
   - Compare with Gemini output

---

### Phase 5: Integration (1 week)

1. **Export Model:**
   - Save trained model
   - Create inference script
   - Test locally first

2. **Replace Gemini:**
   ```javascript
   // In challengeTemplates.js
   async function enhanceWithOurModel({ baseText, ... }) {
     // Call our trained model instead of Gemini
     const response = await fetch('http://vm-ip:8000/generate', {
       method: 'POST',
       body: JSON.stringify({ prompt: baseText })
     });
     return response.json();
   }
   ```

3. **Deploy:**
   - Set up model server on VM
   - Create API endpoint
   - Update backend to use it

---

## 🔧 Technical Details

### Model Architecture:
- **Base:** Mistral 7B or LLaMA 7B
- **Fine-tuning:** LoRA (Low-Rank Adaptation)
- **Why LoRA:** Faster training, less memory, easier to update

### Training Data Format:
```jsonl
{"prompt": "Generate a fitness challenge for a college student", "completion": "Complete a 30-minute outdoor HIIT workout at a campus park, focusing on bodyweight exercises like burpees, jumping jacks, and planks. Document your session with a photo of your workout spot."}
{"prompt": "Generate a social challenge for a college student", "completion": "Start a conversation with someone new in your class and learn about their favorite hobby or interest. Share something interesting about yourself in return."}
```

### Expected Training Time:
- **Small dataset (500 examples):** 2-4 hours
- **Medium dataset (1000 examples):** 4-8 hours
- **Large dataset (5000+ examples):** 1-2 days

---

## 💰 Cost Comparison

### Current (Gemini API):
- Free tier: 1,500 requests/day
- After free tier: ~$0.01-0.05 per request

### With Our Model:
- **One-time:** Training time (free on school VM)
- **Ongoing:** VM hosting costs (if needed)
- **Per request:** $0 (just compute time)

---

## ✅ Benefits of Our Own Model

1. **No API Limits** - Generate unlimited challenges
2. **No Costs** - Free after initial training
3. **Full Control** - We own the model
4. **Privacy** - Data stays on our VM
5. **Customization** - Train on exactly what we want
6. **Offline** - Works without internet

---

## 🚀 Migration Path

1. **Keep Hybrid System** - Templates stay the same
2. **Swap AI Enhancement** - Replace Gemini call with our model
3. **Gradual Rollout** - Test with small percentage first
4. **A/B Testing** - Compare Gemini vs Our Model
5. **Full Migration** - Switch completely when ready

---

## 📝 Next Steps (When You Get VM Access)

1. ✅ Set up VM environment
2. ✅ Install dependencies
3. ✅ Collect training data (start now!)
4. ✅ Choose base model
5. ✅ Fine-tune model
6. ✅ Deploy and integrate

---

## 🎯 Current Status

**Hybrid System:** ✅ **WORKING**  
**VM Training:** ⏳ **WAITING FOR VM ACCESS**  
**Data Collection:** Can start now by saving generated challenges

**You can start collecting training data right now** by logging all generated challenges. When you get VM access, you'll have a dataset ready to train on!

---

**The hybrid system is ready. When you get VM access, we can train our own model and swap it in!** 🚀

