package <%= package.lower %>.<%= project.lower %>.push;

import com.google.gson.Gson;
import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 *
 * @author gladson
 */
public class PushMessageEncoder implements Encoder.Text<PushMessage> {
    private static final Logger LOG = getLogger(PushMessageEncoder.class.getName());

    /**
     *
     * @param config
     */
    @Override
    public void init(final EndpointConfig config) {
    }

    /**
     *
     */
    @Override
    public void destroy() {
    }

    /**
     *
     * @param chatMessage
     * @return
     * @throws EncodeException
     */
    @Override
    public String encode(final PushMessage chatMessage) throws EncodeException {
        return new Gson().toJson(chatMessage);
    }
}
