package app.dao;

import app.entity.Todo;
import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.demoiselle.jee.crud.AbstractDAO;

/**
 *
 * @author gladson
 */
public class TodoDAO extends AbstractDAO<Todo, String> {

    private static final Logger LOG = getLogger(TodoDAO.class.getName());

    @PersistenceContext(unitName = "TodoPU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

}
