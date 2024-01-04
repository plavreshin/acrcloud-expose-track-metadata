import { Express } from 'express';
import jwt from 'jsonwebtoken';
import { AppConfiguration } from 'src/types/configuration';

export default class Routes {
  private readonly config: AppConfiguration;

  constructor(config: AppConfiguration) {
    this.config = config;
  }

  public registerPublicRoutes = (app: Express): void => {
    app.get('/_healthcheck', (_, res) => res.status(200).send('ok'));
    app.get('/login', (req, res) => {
      if (req.body?.email) {
        const { email } = req.body;
        const token = jwt.sign({ email }, this.config.secretKey, { expiresIn: '7d' });

        res.send({ token });
      } else {
        res.status(400).send({
          error: 'Missing email',
        });
      }
    });
  };
}
