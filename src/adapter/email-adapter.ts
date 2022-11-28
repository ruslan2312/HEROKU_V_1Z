import nodemailer from "nodemailer";

const mailAccount = {
    user: "heeca@mail.ru",
    pass: "xsnryvygYM5pVmprs4VW"
}
export const emailAdapter = {
    async sendMail(email: string, subject: string, confirmationCode: string): Promise<boolean> {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: mailAccount.user, // generated ethereal user
                pass: mailAccount.pass, // generated ethereal password
            },
        });
        transporter.sendMail({
            from: '"RUSEL" <heeca@mail.ru>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                             <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                        </p>`,  // html body
        });
        return true
    },
    async sendMailRecoveryPassword(email: string, subject: string, recoveryCode: string): Promise<boolean> {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: mailAccount.user, // generated ethereal user
                pass: mailAccount.pass, // generated ethereal password
            },
        });
        transporter.sendMail({
            from: '"RUSEL" <heeca@mail.ru>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: ` <h1>Password recovery</h1>
                         <p>To finish password recovery please follow the link below:
                                 <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
                         </p>`,  // html body
        });
        return true
    }
}