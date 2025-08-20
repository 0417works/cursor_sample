import nodemailer from 'nodemailer';

// メールトランスポーターの設定
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ウェルカムメールの送信
export const sendWelcomeEmail = async (email: string, username: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"掲示板システム" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '掲示板システムへようこそ！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">掲示板システムへようこそ！</h2>
          <p>こんにちは、${username}さん！</p>
          <p>掲示板システムへのご登録ありがとうございます。</p>
          <p>以下の機能をご利用いただけます：</p>
          <ul>
            <li>投稿の作成・編集・削除</li>
            <li>コメントの投稿</li>
            <li>画像のアップロード</li>
            <li>他のユーザーとの交流</li>
          </ul>
          <p>何かご質問がございましたら、お気軽にお問い合わせください。</p>
          <p>よろしくお願いいたします。</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            このメールは掲示板システムから自動送信されています。<br>
            返信はできませんのでご了承ください。
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// パスワードリセットメールの送信
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"掲示板システム" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'パスワードリセットのご案内',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">パスワードリセットのご案内</h2>
          <p>掲示板システムのパスワードリセットが要求されました。</p>
          <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              パスワードをリセット
            </a>
          </div>
          <p><strong>注意：</strong></p>
          <ul>
            <li>このリンクは1時間後に無効になります</li>
            <li>パスワードリセットを要求していない場合は、このメールを無視してください</li>
            <li>セキュリティのため、このリンクは他人と共有しないでください</li>
          </ul>
          <p>何かご質問がございましたら、お気軽にお問い合わせください。</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            このメールは掲示板システムから自動送信されています。<br>
            返信はできませんのでご了承ください。
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// コメント通知メールの送信
export const sendCommentNotificationEmail = async (
  postAuthorEmail: string, 
  postTitle: string, 
  commentAuthorUsername: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"掲示板システム" <${process.env.SMTP_USER}>`,
      to: postAuthorEmail,
      subject: '投稿に新しいコメントがつきました',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">新しいコメントの通知</h2>
          <p>あなたの投稿「${postTitle}」に新しいコメントがつきました。</p>
          <p><strong>コメント投稿者：</strong> ${commentAuthorUsername}</p>
          <p>掲示板システムにログインして、コメントの内容を確認してください。</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              掲示板システムにアクセス
            </a>
          </div>
          <hr>
          <p style="font-size: 12px; color: #666;">
            このメールは掲示板システムから自動送信されています。<br>
            返信はできませんのでご了承ください。
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Comment notification email sent to ${postAuthorEmail}`);
  } catch (error) {
    console.error('Failed to send comment notification email:', error);
    throw error;
  }
};

// メール送信のテスト
export const testEmailService = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // 接続テスト
    await transporter.verify();
    console.log('Email service is working correctly');
    return true;
  } catch (error) {
    console.error('Email service test failed:', error);
    return false;
  }
};
