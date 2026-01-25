import { Router } from 'express';
import { StoreLocation } from '../models/StoreLocation.js';
import { AppError } from '../middleware/errorHandler.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * GET /api/stores
 * Obtiene todas las tiendas (opcionalmente filtradas)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, state, isActive, search } = req.query;

    // Construir filtro
    const filter: any = {};

    if (city) {
      filter.city = new RegExp(city as string, 'i');
    }

    if (state) {
      filter.state = new RegExp(state as string, 'i');
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Búsqueda de texto
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { address: new RegExp(search as string, 'i') },
        { city: new RegExp(search as string, 'i') },
      ];
    }

    const stores = await StoreLocation.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stores,
      count: stores.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stores/:id
 * Obtiene una tienda por ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validar formato de ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('ID inválido', 400);
    }

    const store = await StoreLocation.findById(id);

    if (!store) {
      throw new AppError('Tienda no encontrada', 404);
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stores
 * Crea una nueva tienda
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      address,
      phone,
      hours,
      latitude,
      longitude,
      city,
      state,
      country,
      isActive,
    } = req.body;

    // Validaciones básicas
    if (!name || !address || !latitude || !longitude || !city) {
      throw new AppError('Faltan campos requeridos: name, address, latitude, longitude, city', 400);
    }

    const store = new StoreLocation({
      name,
      address,
      phone,
      hours,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city,
      state,
      country: country || 'México',
      isActive: isActive !== undefined ? isActive : true,
    });

    await store.save();

    res.status(201).json({
      success: true,
      data: store,
      message: 'Tienda creada exitosamente',
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      next(new AppError(messages.join(', '), 400));
    } else {
      next(error);
    }
  }
});

/**
 * PUT /api/stores/:id
 * Actualiza una tienda existente
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validar formato de ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('ID inválido', 400);
    }

    const {
      name,
      address,
      phone,
      hours,
      latitude,
      longitude,
      city,
      state,
      country,
      isActive,
    } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (hours !== undefined) updateData.hours = hours;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (isActive !== undefined) updateData.isActive = isActive;

    const store = await StoreLocation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!store) {
      throw new AppError('Tienda no encontrada', 404);
    }

    res.json({
      success: true,
      data: store,
      message: 'Tienda actualizada exitosamente',
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      next(new AppError(messages.join(', '), 400));
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/stores/:id
 * Elimina una tienda (soft delete marcando isActive como false)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { hard } = req.query; // Si hard=true, elimina físicamente

    // Validar formato de ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('ID inválido', 400);
    }

    if (hard === 'true') {
      // Eliminación física
      const store = await StoreLocation.findByIdAndDelete(id);
      if (!store) {
        throw new AppError('Tienda no encontrada', 404);
      }
      res.json({
        success: true,
        message: 'Tienda eliminada permanentemente',
      });
    } else {
      // Soft delete
      const store = await StoreLocation.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
      );
      if (!store) {
        throw new AppError('Tienda no encontrada', 404);
      }
      res.json({
        success: true,
        data: store,
        message: 'Tienda desactivada exitosamente',
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stores/bulk
 * Crea múltiples tiendas a la vez
 */
router.post('/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stores } = req.body;

    if (!Array.isArray(stores) || stores.length === 0) {
      throw new AppError('Se requiere un array de tiendas', 400);
    }

    const createdStores = await StoreLocation.insertMany(stores, {
      ordered: false, // Continuar aunque haya errores
    });

    res.status(201).json({
      success: true,
      data: createdStores,
      count: createdStores.length,
      message: `${createdStores.length} tiendas creadas exitosamente`,
    });
  } catch (error: any) {
    if (error.name === 'BulkWriteError') {
      next(new AppError('Algunas tiendas no pudieron ser creadas', 400));
    } else {
      next(error);
    }
  }
});

export { router as storeLocationRouter };
