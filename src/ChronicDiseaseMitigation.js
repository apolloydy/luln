import React from 'react';

// 用于显示每个健康措施的小卡片
function MeasureCard({ title, children }) {
  const cardStyle = {
    background: '#fff',
    color: '#333',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '1rem',
    margin: '1rem',
    maxWidth: '600px'
  };

  const titleStyle = {
    marginTop: 0,
    color: '#2c3e50'
  };

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function ChronicDiseaseMitigation() {
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0F2F0 0%, #000C40 100%)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#333'
  };

  const titleStyle = {
    color: '#fff',
    marginBottom: '1rem'
  };

  const subtitleStyle = {
    color: '#fff',
    marginBottom: '2rem'
  };

  const textStyle = {
    lineHeight: 1.6
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Chronic Disease Mitigation</h1>
      <p style={subtitleStyle}>
        如何通过科学的生活方式，延缓或降低「五大慢性病（The Five Horsemen of Chronic Disease）」的风险。
      </p>

      {/* 运动 */}
      <MeasureCard title="1. 运动 (Exercise)">
        <div style={textStyle}>
          <ul>
            <li><strong>Zone 2 有氧训练</strong>：中低强度、心率在最大心率的60-70%左右，持续20-45分钟，增强心肺功能。</li>
            <li><strong>VO₂ Max</strong>：最大摄氧量指标，反映心肺耐力。提高 VO₂ Max 能显著减少心血管疾病风险。</li>
            <li><strong>力量训练 (Strength)</strong>：增加肌肉质量、改善骨密度，帮助预防骨质疏松、维持基础代谢。</li>
          </ul>
          <p>
            <em>作用：</em>运动可显著降低代谢综合征、心血管疾病、部分癌症和神经退行性疾病的风险，延缓衰老。
          </p>
        </div>
      </MeasureCard>

      {/* 癌症早筛 */}
      <MeasureCard title="2. 癌症早筛 (Early Cancer Screening)">
        <div style={textStyle}>
          <p>定期进行癌症早筛，如：</p>
          <ul>
            <li>结直肠癌筛查（肠镜）</li>
            <li>乳腺癌筛查（乳腺X线、超声或MRI）</li>
            <li>宫颈癌筛查（HPV检测、TCT）</li>
            <li>肺癌低剂量CT筛查</li>
            <li>前列腺癌（PSA检测）</li>
          </ul>
          <p>
            <a
              href="https://www.cancer.org/health-care-professionals/american-cancer-society-prevention-early-detection-guidelines.html"
              target="_blank"
              rel="noreferrer"
            >
              更多筛查指南
            </a>
          </p>
          <p>
            <em>作用：</em>早期发现、早期干预可大幅提高治疗成功率，降低癌症相关死亡风险。
          </p>
        </div>
      </MeasureCard>

      {/* 睡眠 */}
      <MeasureCard title="3. 睡眠 (Sleep)">
        <div style={textStyle}>
          <p>
            成人通常需要 7-9 小时的高质量睡眠。
            <br />
            参考：
            <a
              href="https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need"
              target="_blank"
              rel="noreferrer"
            >
              Sleep Foundation
            </a>
          </p>
          <p>
            <em>作用：</em>睡眠不足会增加肥胖、糖尿病、心血管疾病和认知障碍风险；充足睡眠有助身体修复和大脑排毒。
          </p>
        </div>
      </MeasureCard>

      {/* 冥想 */}
      <MeasureCard title="4. 冥想 (Meditation)">
        <div style={textStyle}>
          <p>
            每日冥想 10-20 分钟，专注呼吸或使用引导式放松练习，能减轻压力、焦虑，改善情绪和专注力。
          </p>
          <p>
            <em>作用：</em>长期压力是慢性疾病的重要风险因素，冥想可帮助调节神经内分泌系统，缓解炎症反应。
          </p>
        </div>
      </MeasureCard>

      {/* 饮食 */}
      <MeasureCard title="5. 饮食 (Diet)">
        <div style={textStyle}>
          <ul>
            <li>避免过度加工食品 (Processed Foods)</li>
            <li>减少添加糖 (Added Sugar) 摄入</li>
            <li>远离反式脂肪 (Trans Fats)</li>
            <li>避免过度油炸、高温烹饪</li>
            <li>多摄入蔬菜、水果、全谷物、优质蛋白</li>
          </ul>
          <p>
            <em>作用：</em>健康饮食能显著降低代谢紊乱、糖尿病、心血管疾病和部分癌症的发生风险。
          </p>
        </div>
      </MeasureCard>

      {/* 五大慢性病汇总 */}
      <MeasureCard title="The Five Horsemen of Chronic Disease">
        <div style={textStyle}>
          <p>常见的“五大慢性病”包括：</p>
          <ol>
            <li><strong>心血管疾病</strong>（如冠心病、高血压）</li>
            <li><strong>代谢疾病</strong>（如2型糖尿病、肥胖）</li>
            <li><strong>癌症</strong></li>
            <li><strong>神经退行性疾病</strong>（如阿尔茨海默症、帕金森）</li>
            <li><strong>慢性炎症相关疾病</strong>（关节炎、自身免疫等）</li>
          </ol>
          <p>
            上述运动、早筛、睡眠、冥想、饮食等措施，都有助于延缓或降低这些疾病的发生和进展：
          </p>
          <ul>
            <li>改善代谢与心血管功能，降低肥胖和糖尿病风险</li>
            <li>早期发现并干预癌变，降低癌症死亡率</li>
            <li>减少慢性炎症，保护神经系统健康</li>
            <li>保持心理健康、减轻压力，防止多种疾病叠加</li>
          </ul>
        </div>
      </MeasureCard>

      <p style={{ color: '#fff', marginTop: '2rem', textAlign: 'center' }}>
        <em>注：具体筛查或生活方式干预需咨询专业人士。</em>
      </p>
    </div>
  );
}

export default ChronicDiseaseMitigation;