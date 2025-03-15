// functions/submit.js
export async function onRequest(context) {
    const { request } = context;
    
    // 只处理 POST 请求
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
  
    try {
      // 解析表单数据（或 JSON，取决于前端如何提交）
      const formData = await request.formData();
      const name = formData.get("name") || "";
      const email = formData.get("email") || "";
      const message = formData.get("message") || "";
  
      // 简单校验
      if (!name || !email || !message) {
        return new Response("Please fill in all fields.", { status: 400 });
      }
  
      // 调用发送邮件的函数
      const mailResult = await sendEmailViaMailChannels({ name, email, message });
  
      // 打印 MailChannels 的响应状态和文本
      console.log("MailChannels response status:", mailResult.status);
      const mailText = await mailResult.text();
      console.log("MailChannels response text:", mailText);
  
      if (!mailResult.ok) {
        return new Response("Failed to send message: " + mailText, { status: 500 });
      }
  
      return new Response("Message sent successfully!", { status: 200 });
    } catch (err) {
      // 如果脚本本身出错，也要打印错误
      console.log("submit.js error:", err);
      return new Response("Server error: " + err.message, { status: 500 });
    }
  }
  
  async function sendEmailViaMailChannels({ name, email, message }) {
    // 这里填写你自己的收件邮箱
    const toEmail = "lifeisurgentlifeisnow@gmail.com";
  
    // 构建 MailChannels 请求体
    const mailData = {
      personalizations: [
        {
          to: [{ email: toEmail }],
        },
      ],
      from: {
        // 注意：from 的邮箱最好是你自己的域名，以减少被判为垃圾邮件的风险
        email: "no-reply@luln.org",
        name: "Life is Urgent, Life is Now",
      },
      subject: `New message from ${name}`,
      content: [
        {
          type: "text/plain",
          value: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        },
      ],
    };
  
    console.log("Sending mail with mailData:", mailData);
  
    // 调用 MailChannels API
    return fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailData),
    });
  }