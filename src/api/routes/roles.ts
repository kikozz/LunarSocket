import axios from 'axios';
import { Request, Router } from 'express';
import { DatabaseManager } from '../../databases/Manager';
import events from '../../utils/events';
import findPlayer from '../../utils/findPlayer';
import { getRole } from '../../utils/roles';
import auth from '../middleware/auth';

const rolesRouter = Router();

rolesRouter.patch(
  '/',
  auth,
  async (request: Request<{}, {}, RolesRequestBody>, response) => {
    if (
      typeof request.body.player !== 'string' ||
      typeof request.body.role !== 'string'
    )
      return response.sendStatus(400);

    if (request.body.offline === true) {
      const addDashes = (i) =>
        i.substr(0, 8) +
        '-' +
        i.substr(8, 4) +
        '-' +
        i.substr(12, 4) +
        '-' +
        i.substr(16, 4) +
        '-' +
        i.substr(20);
      const uuid = addDashes(
        (
          await axios.get(
            `https://api.mojang.com/users/profiles/minecraft/${request.body.player}`
          )
        ).data.id
      );
      const player = await DatabaseManager.instance.database.getPlayer(uuid);
      if (!player) return response.sendStatus(404);
      player.role = (await getRole(request.body.role)).default
        ? 'default'
        : request.body.role;
      await DatabaseManager.instance.database.setPlayerRaw(uuid, player);
      return response.sendStatus(200);
    }

    const player = findPlayer(request.body.player);
    if (!player) {
      return response.sendStatus(404);
    }

    const oldRole = player.role.name;
    await player.setRole(request.body.role);
    events.push({
      type: 'role-set',
      value: `${player.username},${player.role.name}`,
    });

    if (oldRole === player.role.name) {
      return response.sendStatus(304);
    } else {
      return response.sendStatus(200);
    }
  }
);

export default rolesRouter;

interface RolesRequestBody {
  player: string;
  role: string;
  offline?: boolean;
}
